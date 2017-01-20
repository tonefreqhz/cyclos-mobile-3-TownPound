import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { View, TextInput, TouchableOpacity, Dimensions, Animated } from 'react-native'
import KeyboardComponent from './KeyboardComponent'
import * as actions from '../store/reducer/sendMoney'
import { openLoginForm } from '../store/reducer/login'
import merge from '../util/merge'
import { LOGIN_STATUSES } from '../store/reducer/login'
import DefaultText from './DefaultText'
import color from '../util/colors'
import { dimensions } from '../util/StyleUtils'

const Page = {
  Ready: 0,
  EnterAmount: 1,
  MakingPayment: 2,
  PaymentComplete: 3,
}

const { width } = Dimensions.get('window')
export const sectionHeight = 68

const styles = {
  button: {
    height: sectionHeight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonInnerContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: 'transparent'
  },
  textInput: {
    ...dimensions(width, sectionHeight),
    padding: 10,
    textAlign: 'center'
  }
}

class InputComponent extends KeyboardComponent {
  getButtonColor() {
    if (this.props.invalidInput) {
      return color.offWhite
    }
    return color.bristolBlue
  }

  getButtonTextColor() {
    return this.getButtonColor() === color.offWhite ? 'black' : 'white'
  }

  render() {
    let { onButtonPress, buttonText, input, invalidInput, accessibilityLabel } = this.props

    return <Animated.View style={{backgroundColor: 'white', bottom: input ? this.state.keyboardHeight : 0}} accessibilityLabel={accessibilityLabel}>
      <TouchableOpacity style={merge(styles.button, {backgroundColor: this.getButtonColor()})}
          onPress={invalidInput ? undefined : onButtonPress}>
        <View style={styles.buttonInnerContainer}>
          <DefaultText style={{fontSize: 24, color: this.getButtonTextColor(), textAlign: 'center', width: Dimensions.get('window').width - 20}}>
            {buttonText}
          </DefaultText>
        </View>
      </TouchableOpacity>

      { input
        ? <TextInput style={styles.textInput}
              {...input}
              autoFocus={true}
              accessibilityLabel={input.placeholder} />
      : undefined }

    </Animated.View>
  }
}


class SendMoney extends React.Component {

  constructor() {
    super()
    this.state = {
      inputPage: Page.Ready,
    }
  }

  nextPage() {
    const nextPage = (this.state.inputPage + 1) % Object.keys(Page).length
    this.setState({ inputPage: nextPage })
    if (nextPage === Page.PaymentComplete) {
      setTimeout(() => {
        if (this.state.inputPage === Page.PaymentComplete) {
          this.nextPage()
        }
      }, 100)
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.businessId !== prevProps.businessId) {
      this.props.updateAmount('')
      this.setState({ inputPage: Page.Ready })
    } else if (prevProps.loading && !this.props.loading && this.state.inputPage === 2) {
      this.nextPage()
    }
  }

  isInputInvalid() {
    const { amount } = this.props
    return (
      isNaN(Number(this.props.amount))
        || Number(amount) > this.props.balance
        || Number(amount) <= 0
        || (amount.charAt(0) === '0' && amount.charAt(1) !== '.')
        || amount.charAt(amount.length - 1) === '.'
        || (amount.split('.')[1] && amount.split('.')[1].length > 2)
    )
  }

  render() {
    let inputProps

    if (this.props.connection) {
      if (this.state.inputPage === Page.PaymentComplete) {
        inputProps = {
          buttonText: this.props.message,
          onButtonPress: () => { this.nextPage() },
          accessibilityLabel: 'Payment complete'
        }
      } else if (this.props.loggedIn) {
        switch (this.state.inputPage){
          case Page.Ready: // Initial state, ready to begin
            inputProps = {
              buttonText: 'Send Payment',
              onButtonPress: () => { this.props.updatePayee(this.props.payeeShortDisplay); this.nextPage() },
              accessibilityLabel: 'Ready',
            }
            break
          case Page.EnterAmount: // provide amount
            inputProps = {
              buttonText: 'Pay ' + this.props.payeeDisplay,
              onButtonPress: () => { this.props.sendTransaction(); this.nextPage() },
              input: {
                keyboardType: 'numeric',
                value: this.props.amount,
                placeholder: 'Amount',
                onChangeText: amt => this.props.updateAmount(amt),
              },
              invalidInput: this.isInputInvalid(),
              accessibilityLabel: 'Enter Amount',
            }
            break
          case Page.MakingPayment: // in progress
            inputProps = {
              buttonText: 'Making Payment',
              loading: true,
              accessibilityLabel: 'Making Payment',
            }
            break
        }
      } else {
        inputProps = {
          buttonText: 'Log in to make payment',
          onButtonPress: () => this.props.openLoginForm(true),
          accessibilityLabel: 'Log in to make payment',
        }
      }
    } else {
      inputProps = {
        buttonText: 'No internet connection',
        accessibilityLabel: 'No internet connection',
      }
    }

    return <InputComponent {...inputProps} />
  }
}

const mapDispatchToProps = (dispatch) =>
  bindActionCreators({ ...actions, openLoginForm }, dispatch)

const mapStateToProps = (state) => ({
  ...state.sendMoney,
  balance: state.account.balance,
  loggedIn: state.login.loginStatus === LOGIN_STATUSES.LOGGED_IN,
  connection: state.networkConnection.status
})

export default connect(mapStateToProps, mapDispatchToProps)(SendMoney)
