import { ListView } from 'react-native'
import haversine from 'haversine'
import _ from 'lodash'
import moment from 'moment'
import merge from '../../util/merge'
import { getBusinesses, getBusinessProfile } from '../../api'

const initialState = {
  businessList: [],
  businessListTimestamp: null,
  visibleBusinesses: [],
  businessListExpanded: false,
  selectedBusinessId: undefined,
  dataSource: new ListView.DataSource({
    rowHasChanged: (a, b) => a.shortDisplay !== b.shortDisplay
  }),
  userLocation: { latitude: 51.455, longitude:  -2.588 },
  mapViewport: {
    latitude: 51.455,
    longitude: -2.588,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1
  },
  searchMode: false
}

export const expandBusinessList = (expand) => ({
  type: 'business/EXPAND_BUSINESS_LIST',
  expand
})

export const businessListReceived = (businessList) => ({
  type: 'business/BUSINESS_LIST_RECEIVED',
  businessList
})

export const businessProfileReceived = (businessProfile) => ({
  type: 'business/BUSINESS_PROFILE_RECEIVED',
  businessProfile
})

export const updatePosition = (position) => ({
  type: 'business/POSITION_UPDATED',
  position
})

export const updateMapViewport = (viewport) => ({
  type: 'business/UPDATE_MAP_VIEWPORT',
  viewport
})

export const enableSearchMode = (enable) => ({
  type: 'business/SEARCH_MODE_ENABLED',
  enable
})

const selectBusiness = (businessId) => ({
  type: 'business/SELECTED_BUSINESS',
  businessId
})

export const selectAndLoadBusiness = (businessId) =>
  (dispatch, getState) => {
    dispatch(selectBusiness(businessId))
    const businessList = getState().business.businessList
    const business = businessList.find(b => b.id === businessId)
    if (!business.profilePopulated) {
      getBusinessProfile(businessId, dispatch)
        .then(businessProfile => dispatch(businessProfileReceived(businessProfile)))
        .catch(console.error)
    }
  }

export const loadBusinessList = () =>
  (dispatch, getState) => {
    const persistedDate = getState().business.businessListTimestamp
    if (Date.now() - persistedDate > moment.duration(2, 'days')) {
      getBusinesses(dispatch)
        .then(businesses => dispatch(businessListReceived(businesses)))
        .catch(console.error)
    }
  }

const distanceFromPosition = (position) => (business) =>
  business.address ? haversine(position, business.address.location) : Number.MAX_VALUE

const isWithinViewport = (position) => (business) =>
  business.address &&
  Math.abs(business.address.location.latitude - position.latitude) < position.latitudeDelta &&
  Math.abs(business.address.location.longitude - position.longitude) < position.longitudeDelta

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'business/BUSINESS_LIST_RECEIVED':
      const sortedBusiness = _.sortBy(action.businessList, distanceFromPosition(state.mapViewport))
      const filteredBusiness = sortedBusiness.filter(isWithinViewport(state.mapViewport))
      state = merge(state, {
        dataSource: state.dataSource.cloneWithRows(filteredBusiness),
        businessList: action.businessList,
        businessListTimestamp: new Date(),
        visibleBusinesses: action.businessList
      })
      break
    case 'business/BUSINESS_PROFILE_RECEIVED':
      const index  = _.findIndex(state.businessList, {id: action.businessProfile.id})

      let additionalFields = {}
      if (action.businessProfile.customValues) {
        additionalFields = _.fromPairs(
          _.map(action.businessProfile.customValues, fieldEntry => [
            fieldEntry.field.internalName,
            fieldEntry.stringValue
          ])// shape: list of 2-element lists ([[name, value],[name1, value1], ...])
        ) // turns into object from key-value pairs ({name:value, name1:value1})
      }

      const updatedBusiness = merge(
        state.businessList[index],
        {profilePopulated: true},
        action.businessProfile,
        additionalFields
      )
      const newBusinessList = [
        ..._.slice(state.businessList, 0, index),
        updatedBusiness,
        ..._.slice(state.businessList, index + 1)
      ]
      state = merge(state, {
        businessList: newBusinessList
      })
      break
    case 'business/UPDATE_MAP_VIEWPORT':
      const newViewport = merge(state.mapViewport, action.viewport)
      const sorted = _.sortBy(state.businessList, distanceFromPosition(newViewport))
      const filtered = sorted.filter(isWithinViewport(newViewport))
      state = merge(state, {
        dataSource: state.dataSource.cloneWithRows(filtered),
        mapViewport: newViewport,
        visibleBusinesses: filtered
      })
      break
    case 'business/POSITION_UPDATED':
      state = merge(state, {
        userLocation: action.position
      })
      break
    case 'business/EXPAND_BUSINESS_LIST':
      state = merge(state, {
        businessListExpanded: action.expand
      })
      break
    case 'business/SEARCH_MODE_ENABLED':
      state = merge(state, {
        searchMode: action.enable,
        dataSource: action.enable
          ? state.dataSource.cloneWithRowsAndSections({
                closest: state.visibleBusinesses,
              },
              [ 'closest' ]
            )
            : state.dataSource.cloneWithRows(state.visibleBusinesses),
        businessListExpanded: action.enable
      })
      break
    case 'business/SELECTED_BUSINESS':
      state = merge(state, {
        selectedBusinessId: action.businessId
      })
      break
  }
  return state
}

export default reducer
