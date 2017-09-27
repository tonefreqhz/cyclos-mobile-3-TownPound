import React from 'react'
import animateTo from '../../util/animateTo'
import Price from '../Price'
import commonStyle from '../style'
import Colors from '@Colors/colors'
import Config from '@Config/config'
import DefaultText from '../DefaultText'
import merge from '../../util/merge'
import KeyboardComponent from '../KeyboardComponent'
import { View, TextInput, TouchableOpacity, Animated, Image } from 'react-native'
import styles from './InputComponentStyle'
import Images from '@Assets/images'
import Drawer from 'react-native-drawer'

export const labels = {
    AMOUNT: 'Amount',
    CASH_ONLY_BUSINESS: Config.CASH_ONLY_TEXT,
    CONFIRM: 'Confirm',
    CURRENT_BALANCE: 'CURRENT BALANCE',
    DESCRIPTION: 'Description (optional)',
    ENTER_AMOUNT: 'Enter Amount',
    LOGIN_FOR_PAYMENT: 'Log in to make payment',
    MAKING_PAYMENT: 'Making Payment',
    NO_PAYMENT_AVAILABLE: 'No payment available',
    PAY: 'Pay',
    PAYMENT_COMPLETE: 'Payment complete',
    PIN: 'PIN',
    SEND_PAYMENT: 'Send Payment',
    USING_TXT2PAY: 'No internet connection (Using TXT2PAY)',
}

const BalanceMessage = ({ balance }) => {
  return (
    <View style={styles.balanceContainer}>
      <DefaultText style={commonStyle.sectionHeader.text}>{labels.CURRENT_BALANCE}</DefaultText>
      <View style={styles.priceContainer}>
        <Image source={Images.balanceSymbol}/>
        <Price prefix=''
            price={balance}
            size={30}
            color={Colors.primaryBlue}/>
      </View>
    </View>
  )
}

class InputComponent extends KeyboardComponent {
  getButtonColor () {
    if (this.props.invalidInput || this.props.buttonText === labels.NO_PAYMENT_AVAILABLE) {
      return Colors.offWhite
    }
    else if (this.props.buttonText === labels.CASH_ONLY_BUSINESS) {
      return Colors.secondaryBlue
    }
    return Colors.primaryBlue
  }

  getButtonTextColor () {
    return this.getButtonColor() === Colors.offWhite ? 'black' : 'white'
  }

  componentWillUpdate(nextProps) {
    if (nextProps.accessibilityLabel !== labels.ENTER_AMOUNT) {
      animateTo(this.state.keyboardHeight, 0, 50)
    }
  }

  render () {
    let {
      onButtonPress,
      buttonText,
      input,
      cashpoint,
      descriptionInput,
      pinInput,
      invalidInput,
      accessibilityLabel,
      balance,
      amount,
      description,
      onChangeAmount,
      payee,
      offlinePaymentLabel
    } = this.props

    const button = <View style={merge(styles.button, { backgroundColor: this.getButtonColor() })}>
      <DefaultText style={merge(styles.buttonText, { color: this.getButtonTextColor() })}>
        {buttonText}
      </DefaultText>
      {offlinePaymentLabel &&
        <DefaultText style={styles.noInternetMessage}>
          {offlinePaymentLabel}
        </DefaultText>}
    </View>

    // {cashpoint
    //   ?   <Swiper style={{flex: 1, height: 30}}>
    //         <View style={{flex:1, backgroundColor: 'blue'}}>
    //           <DefaultText>Hello Swiper</DefaultText>
    //         </View>
    //         <View style={{flex:1, backgroundColor: 'green'}}>
    //           <DefaultText>Goodbye Swiper</DefaultText>
    //         </View>
    //         <View style={{flex:1, backgroundColor: 'blue'}}>
    //           <DefaultText>Hello Swiper</DefaultText>
    //         </View>
    //       </Swiper>
    //   :   <TouchableOpacity onPress={invalidInput ? undefined : onButtonPress}>
    //         {button}
    //       </TouchableOpacity>
    // }

    return (
          <Animated.View style={{backgroundColor: 'white', bottom: this.state.keyboardHeight }} accessibilityLabel={accessibilityLabel}>


          <View style={styles.cashpointDrawer}>
              <Drawer
                  type={'overlay'}
                  captureGestures={true}
                  tapToClose={true}
                  closedDrawerOffset={0.1}
                  openDrawerOffset={0.025}
                  side={'right'}
                  acceptTap={true}
                  negotiatePan={true}
                  content={
                    <View style={{flex:1, backgroundColor: 'blue',
                        shadowOffset:{width: -5, height: 5},
                        shadowColor: 'black',
                        shadowOpacity: 0.5
                      }}>
                      <DefaultText>Hello Swiper</DefaultText>
                    </View>}>
                <View style={{flex:1, backgroundColor: 'green'}}>
                    <DefaultText>Hello Swiper</DefaultText>
                </View>

              </Drawer>
          </View>





          {input
            ? <View>
                <TextInput style={styles.textInput}
                    {...input}
                    autoFocus={true}
                    underlineColorAndroid={Colors.transparent}
                    accessibilityLabel={input.placeholder} />
                <View style={styles.separator}/>
                {pinInput
                  ? <TextInput style={styles.textInput}
                      {...pinInput}
                      underlineColorAndroid={Colors.transparent}
                      accessibilityLabel={pinInput.placeholder} />
                  : <TextInput style={styles.textInput}
                      {...descriptionInput}
                      underlineColorAndroid={Colors.transparent}
                      accessibilityLabel={descriptionInput.placeholder} />
                }
                <BalanceMessage balance={balance}/>
              </View>
            : undefined}

          {amount
            ? <TouchableOpacity onPress={onChangeAmount}>
                <View style={styles.confirmContainer}>
                  <View style={styles.confirmPayeeContainer}>
                    <DefaultText style={styles.confirmPayeeText}>
                      {payee}
                    </DefaultText>
                  </View>
                  {description.trim() != "" &&
                  <View style={styles.confirmDescriptionContainer}>
                    <DefaultText style={styles.confirmDescriptionText}>
                      {description}
                    </DefaultText>
                  </View>}
                  <View style={styles.confirmAmountContainer}>
                    <Image source={Images.balanceSymbol}/>
                    <Price prefix=''
                        price={amount}
                        size={24}
                        color={'black'}/>
                  </View>
                </View>
              </TouchableOpacity>
              : undefined
          }

        </Animated.View>
      )

  }
}

export default InputComponent
