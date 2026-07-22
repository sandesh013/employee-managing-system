// Wraps the browser's Geolocation API in a Promise. Resolves to null (never
// rejects) if the browser doesn't support it, permission is denied, or it
// times out — so a location failure never blocks attendance check-in/out,
// it just gets recorded without coordinates.
export function getCurrentLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({ lat: position.coords.latitude, lng: position.coords.longitude })
      },
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    )
  })
}
