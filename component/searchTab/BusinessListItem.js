import React from 'react'
import { View } from 'react-native'
import DefaultText from '../DefaultText'
import ProfileImage from '../profileImage/ProfileImage'
import styles from './BusinessListStyle'
import merge from '../../util/merge'

class BusinessListItem extends React.Component {
  shouldComponentUpdate(nextProps) {
    return nextProps.business.colorCode !== this.props.business.colorCode
  }

  setNativeProps() {
    this.refs.businessListItem.setNativeProps(this.props)
  }

  render() {
    const { container, contents, status, statusSelected, title, verticalStack } = styles.listItem
    const { image, category, display, shortDisplay, colorCode } = this.props.business
    const statusStyle = merge(status, this.props.isSelected ? statusSelected : {})
    return (
      <View style={container} ref="businessListItem">
          <View>
              <View style={statusStyle}/>
              <View style={contents}>
                  <ProfileImage image={image ? {uri: image.url} : undefined} style={styles.listItem.image} category={category || 'shop'} borderColor='offWhite' colorCode={colorCode}/>
                  <View style={verticalStack}>
                      <DefaultText style={title}>{display}</DefaultText>
                      <DefaultText style={styles.listItem.shortDisplay}>{shortDisplay}</DefaultText>
                  </View>
              </View>
          </View>
      </View>
    )
  }
}


export const SelectedBusiness = (props) =>
  <BusinessListItem {...{ ...props, isSelected: true }}/>

export default BusinessListItem
