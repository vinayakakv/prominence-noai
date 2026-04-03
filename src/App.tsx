import 'maplibre-theme/icons.default.css'
import 'maplibre-theme/modern.css'
import 'maplibre-react-components/style.css'
import maplibregl from 'maplibre-gl'
import {
  RFullscreenControl,
  RGeolocateControl,
  RGlobeControl,
  RLayer,
  RMap,
  RNavigationControl,
  RScaleControl,
  RSource,
} from 'maplibre-react-components'

const mountain: [number, number] = [6.4546, 46.1067]

import mlContour from 'maplibre-contour'
import { useState } from 'react'

export const demSource = new mlContour.DemSource({
  url: 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png',
  encoding: 'terrarium',
  maxzoom: 13,
  worker: true,
})

demSource.setupMaplibre(maplibregl)

export const contourTileUrl = demSource.contourProtocolUrl({
  thresholds: {
    9: [500, 1000],
    10: [200, 1000],
    11: [100, 500],
    12: [50, 200],
    13: [20, 100],
    14: [10, 50],
  },
  elevationKey: 'ele',
  levelKey: 'level',
  contourLayer: 'contours',
})

const App = () => {
  const [selectedElevation, setSelectedElevation] = useState<number | null>(
    null,
  )
  console.log('selectedElevation', selectedElevation)
  return (
    <RMap
      initialCenter={mountain}
      initialZoom={8}
      id="my-map"
      mapStyle="https://tiles.openfreemap.org/styles/positron"
    >
      <RNavigationControl position="top-right" visualizePitch={true} />
      <RGeolocateControl
        position="bottom-right"
        showUserLocation={true}
        showAccuracyCircle={true}
        trackUserLocation={true}
      />
      <RFullscreenControl position="top-left" />
      <RGlobeControl position="top-left" />
      <RScaleControl position="bottom-right" unit="metric" />
      <RSource
        id="satellite"
        type="raster"
        tiles={[
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        ]}
      />
      <RSource
        type="raster-dem"
        id="dem"
        tiles={[demSource.sharedDemProtocolUrl]}
        encoding="terrarium"
      />
      <RSource id="contour" type="vector" tiles={[contourTileUrl]} />
      {/*<RLayer id="satellite-layer" source="satellite" type="raster" />*/}
      <RLayer
        id="hillshade"
        type="hillshade"
        source="dem"
        paint={{
          'hillshade-exaggeration': 0.5,
          'hillshade-illumination-direction': 335,
          'hillshade-shadow-color': '#3d2f1e',
          'hillshade-highlight-color': '#ffffff',
          'hillshade-accent-color': '#3d2f1e',
        }}
      />
      <RLayer
        id="cotour"
        type="line"
        source="contour"
        source-layer="contours"
        paint={{
          'line-color': [
            'case',
            ['==', ['get', 'level'], 1],
            '#666666',
            '#aaaaaa',
          ],
          'line-width': ['case', ['==', ['get', 'level'], 1], 1.5, 0.75],
          'line-opacity': 0.9,
        }}
      />
      <RLayer
        id="cotour-click"
        type="line"
        source="contour"
        source-layer="contours"
        paint={{
          'line-width': 10,
          'line-opacity': 0,
        }}
        onClick={(e) => {
          setSelectedElevation(Number(e.features?.at(0)?.properties['ele']))
        }}
      />
      <RLayer
        id="selected-contour"
        type="line"
        source="contour"
        source-layer="contours"
        filter={['==', ['get', 'ele'], selectedElevation]}
        paint={{
          'line-color': '#f97316',
          'line-width': 2.5,
          'line-opacity': 1,
        }}
      />
    </RMap>
  )
}

export default App
