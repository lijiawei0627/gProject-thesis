function regeocoder (lnglatXY, complete) {
  let resultInfo = {}
  let geocoder = new AMap.Geocoder({radius: 1000, extensions: 'all'})
  geocoder.getAddress(lnglatXY, (status, result) => {
    if (status === 'complete' && result.info === 'OK') {
      let addressComponent = result.regeocode.addressComponent
      resultInfo.address = result.regeocode.formattedAddress
      resultInfo.province = addressComponent.province
      resultInfo.city = addressComponent.city
      resultInfo.citycode = addressComponent.citycode
      resultInfo.district = addressComponent.district
      resultInfo.adcode = addressComponent.adcode
      resultInfo.township = addressComponent.township
      resultInfo.street = addressComponent.street
      resultInfo.streetNumber = addressComponent.streetNumber
      resultInfo.neighborhood = addressComponent.neighborhood
      resultInfo.neighborhoodType = addressComponent.neighborhoodType
      resultInfo.building = addressComponent.building
      complete(resultInfo)
    }
  })
}

// 获取定位信息
export function getPosition () {
  let map = true
  let geolocation = true
  let isRegeo = true
  let defere = new Promise(function (resolve, reject) {
    map = new AMap.Map('container', {resizeEnable: true})
    map.plugin('AMap.Geolocation', () => {
      geolocation = new AMap.Geolocation({
        enableHighAccuracy: true,
        timeout: 20000,
        buttonOffset: new AMap.Pixel(10, 20),
        zoomToAccuracy: true,
        buttonPosition: 'RB'
      })
      geolocation.getCurrentPosition()
      AMap.event.addListener(geolocation, 'complete', (data) => {
        if (isRegeo) {
          regeocoder([data.position.getLng(), data.position.getLat()], (result) => {
            resolve(result)
          })
        }
      })
      AMap.event.addListener(geolocation, 'error', (data) => {
        reject(data.message)
      })
    })
  })
  return defere
}
