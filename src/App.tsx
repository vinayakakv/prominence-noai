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

const SOURCE_IDS = {
  satellite: 'satellite',
  dem: 'dem',
  contour: 'contour',
} as const

const LAYER_IDS = {
  hillshade: 'hillshade',
  contour: 'cotour',
  contourClick: 'cotour-click',
  selectedContour: 'selected-contour',
} as const

const SOURCE_LAYERS = {
  contours: 'contours',
} as const

const FEATURE_KEYS = {
  ele: 'ele',
  level: 'level',
} as const

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
  elevationKey: FEATURE_KEYS.ele,
  levelKey: FEATURE_KEYS.level,
  contourLayer: SOURCE_LAYERS.contours,
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
        id={SOURCE_IDS.satellite}
        type="raster"
        tiles={[
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        ]}
      />
      <RSource
        type="raster-dem"
        id={SOURCE_IDS.dem}
        tiles={[demSource.sharedDemProtocolUrl]}
        encoding="terrarium"
      />
      <RSource id={SOURCE_IDS.contour} type="vector" tiles={[contourTileUrl]} />
      {/*<RLayer id="satellite-layer" source={SOURCE_IDS.satellite} type="raster" />*/}
      <RLayer
        id={LAYER_IDS.hillshade}
        type="hillshade"
        source={SOURCE_IDS.dem}
        paint={{
          'hillshade-exaggeration': 0.5,
          'hillshade-illumination-direction': 335,
          'hillshade-shadow-color': '#3d2f1e',
          'hillshade-highlight-color': '#ffffff',
          'hillshade-accent-color': '#3d2f1e',
        }}
      />
      <RLayer
        id={LAYER_IDS.contour}
        type="line"
        source={SOURCE_IDS.contour}
        source-layer={SOURCE_LAYERS.contours}
        paint={{
          'line-color': [
            'case',
            ['==', ['get', FEATURE_KEYS.level], 1],
            '#666666',
            '#aaaaaa',
          ],
          'line-width': ['case', ['==', ['get', FEATURE_KEYS.level], 1], 1.5, 0.75],
          'line-opacity': 0.9,
        }}
      />
      <RLayer
        id={LAYER_IDS.contourClick}
        type="line"
        source={SOURCE_IDS.contour}
        source-layer={SOURCE_LAYERS.contours}
        paint={{
          'line-width': 10,
          'line-opacity': 0,
        }}
        onClick={(e) => {
          setSelectedElevation(Number(e.features?.at(0)?.properties[FEATURE_KEYS.ele]))
        }}
      />
      <RLayer
        id={LAYER_IDS.selectedContour}
        type="line"
        source={SOURCE_IDS.contour}
        source-layer={SOURCE_LAYERS.contours}
        filter={['==', ['get', FEATURE_KEYS.ele], selectedElevation]}
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
