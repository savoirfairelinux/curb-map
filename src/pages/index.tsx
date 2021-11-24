import { CurbFeatureCollection } from "@/common/curblr";
import { DateTimePickerComponent } from '@syncfusion/ej2-react-calendars';
import { feature, featureCollection, GeoJSONObject } from "@turf/helpers";
import "ant-design-pro/dist/ant-design-pro.css"; // Import whole style
import { Pie } from "ant-design-pro/lib/Charts";
import { Button, Card, Descriptions, Icon, Layout, Radio, Select } from "antd";
import axios from 'axios';
import { connect } from "dva";
import { fromJS } from "immutable";
import React from "react";
import MapGL, {Popup, FullscreenControl, GeolocateControl, Marker, NavigationControl, ScaleControl } from "react-map-gl";
import Geocoder from 'react-map-gl-geocoder';
//mapstyle, change to dark matter
import { actions as curblrActions, geoDataFiles } from "../models/curblr";
import './index.css';
import {
  ACTIVITY_COLOR_MAP,
  avgParkingLength, Content, dataLayer, defaultMapStyle, fullscreenControlStyle,
  geolocateStyle, ICON, mapboxAccessToken, mapStateToProps, MAXSTAY_COLOR_MAP, navStyle, PageProps, renderCurblrData, scaleControlStyle, SIZE
} from "./mapboxAccessToken";
import Geometry from 'ol/geom/Geometry';
import { AiFillCaretUp, AiFillCaretDown, AiOutlineClose, AiFillWarning, AiOutlinePushpin } from "react-icons/ai";
import mapboxgl, { LngLat } from "mapbox-gl";
import {isMobile} from 'react-device-detect';
import { formatMessage, setLocale, getLocale, FormattedMessage } from 'umi-plugin-locale';
import CookieConsent, { Cookies } from "react-cookie-consent";
import { Link } from 'umi';

/**
 * Sources:
 * Bornes de recharge éléctrique https://lecircuitelectrique.com/fr/trouver-une-borne/
 * Bornes communauto: https://montreal.communauto.com/fonctionnement/
 */

let geojson = {
  type: 'FeatureCollection',
  features: [{
    id: 0,
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [-73.608657, 45.539313],
      properties: {
        title: 'Station No 181',
        type: 'communauto',
        description: '',
        address: 'St-André et Bélanger',
        count: 0,
        price_per_hour: 1,
        on_street: false,
        img: './communauto_181.png'
      }
    },
    image: 'https://i.ibb.co/jMM1V13/commauto.png'
  },
  {
    id: 1,
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [-73.60406, 45.535913],
      properties: {
        title: 'Station No 427',
        type: 'communauto',
        description: '',
        address: 'De Chateaubriand et Beaubien',
        count: 6,
        price_per_hour: 1,
        on_street: false,
        img: './communauto_427.png'
      }
    },
    image: 'https://i.ibb.co/jMM1V13/commauto.png'
  },
  {
    id: 2,
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [-73.604969, 45.537919],
      properties: {
        title: 'Station No 034',
        type: 'communauto',
        description: '',
        address: 'Boyer et St-Zotique',
        count: 10,
        price_per_hour: 1,
        on_street: false,
        img: './communauto_034.png'
      }
    },
    image: 'https://i.ibb.co/jMM1V13/commauto.png'
  },
  {
    id: 3,
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [-73.596864, 45.533244],
      properties: {
        title: '324 | BSR | RPP | 5808 St-Hubert',
        type: 'electrique',
        description: '',
        address: '5808 St-Hubert Montréal QC H2S 2L7',
        count: 4,
        price_per_hour: 1,
        on_street: true,
        img: null
      }
    },
    image: 'https://i.ibb.co/dctXGTQ/Logo-Le-Circuit-lectrique.png'
  },
  {
    id: 4,
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [-73.59958, 45.534474],
      properties: {
        title: '313 | BSR | RPP | 6036 St-Hubert',
        type: 'electrique',
        description: '',
        address: '6036 St-Hubert Montréal QC H2S 2L7',
        count: 2,
        price_per_hour: 1,
        on_street: true,
        img: null
      }
    },
    image: 'https://i.ibb.co/dctXGTQ/Logo-Le-Circuit-lectrique.png'
  },
  {
    id: 5,
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [-73.603005, 45.536686],
      properties: {
        title: '301 | BSR | RPP | 6511 St-André',
        type: 'electrique',
        description: '',
        address: '6511 Rue Saint-André Montréal QC H2S 2K7',
        count: 2,
        price_per_hour: 1,
        on_street: true,
        img: null
      }
    },
    image: 'https://i.ibb.co/dctXGTQ/Logo-Le-Circuit-lectrique.png'
  },
  {
    id: 6,
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [-73.606817, 45.539041],
      properties: {
        title: '350 | BSR | RPP | 6776 boyer',
        type: 'electrique',
        description: '',
        address: '6776 Boyer Montréal QC H2S 2J7',
        count: 2,
        price_per_hour: 1,
        on_street: true,
        img: null
      }
    },
    image: 'https://i.ibb.co/dctXGTQ/Logo-Le-Circuit-lectrique.png'
  },
  {
    id: 7,
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [-73.605241, 45.539199],
      properties: {
        title: '307 | BSR | RPP | 1031 St-Zotique',
        type: 'electrique',
        description: '',
        address: '1031 Rue Saint-Zotique E Montréal QC H2S 1N1',
        count: 2,
        price_per_hour: 1,
        on_street: true,
        img: null
      }
    },
    image: 'https://i.ibb.co/dctXGTQ/Logo-Le-Circuit-lectrique.png'
  },
  {
    id: 8,
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [-73.60504580868175, 45.53805504325079],
      properties: {
        title: 'Terrain 024- Saint-André',
        type: 'normal',
        description: '',
        address: '',
        count: 91,
        price_per_hour: 2.75,
        price_per_day: 12,
        handicapped_count: 1,
        regulation: '24 h/24',
        on_street: false,
        img: null
      }
    },
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Parking_icon.svg/1024px-Parking_icon.svg.png'
  },
  {
    id: 9,
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [-73.60147468653966, 45.53633753212596],
      properties: {
        title: 'Terrain 303 Saint-André',
        type: 'normal',
        description: '',
        address: '',
        count: 101,
        price_per_hour: 2.75,
        price_per_day: 12,
        handicapped_count: 2,
        regulation: '24 h/24',
        on_street: false,
        img: null
      }
    },
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Parking_icon.svg/1024px-Parking_icon.svg.png'
  },
  {
    id: 10,
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [-73.6120972, 45.5408585],
      properties: {
        title: 'Terrain 191 - Saint-André',
        type: 'normal',
        description: 'Lun au Dim 24 h/24 : 12 $/max jour',
        address: 'Entre Bélanger et Jean-Talon',
        count: 45,
        price_per_hour: 2.75,
        price_per_day: 12,
        handicapped_count: 0,
        regulation: '24 h/24',
        on_street: false,
        img: null
      }
    },
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Parking_icon.svg/1024px-Parking_icon.svg.png'
  },
  {
    id: 11,
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [-73.60841502145779, 45.53976221327919],
      properties: {
        title: 'Terrain 078 Boyer',
        type: 'normal',
        description: '24 h/24 : 14 $/max jour - 3 places réservées aux personnes handicapées',
        address: '',
        count: 264,
        price_per_hour: 3.50,
        price_per_day: 14,
        handicapped_count: 3,
        regulation: '24 h/24',
        on_street: false,
        img: null
      }
    },
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Parking_icon.svg/1024px-Parking_icon.svg.png'
  }
]
}


class Map extends React.Component<PageProps, {}> {
  _mapRef: any;

  state = {
    mode: "activity",
    day: "mo",
    time: "08:01",
    mapStyle: defaultMapStyle,
    viewport: {
      width: "100vw",
      height: "100vh",
      latitude: 45.5375724,
      longitude: -73.6066974,
      zoom: 16  
    },
    showHideCard: true,
    sl_arrondRef: "plaza",
    set_dateTimeRef: new Date(),
    data_to_replace: new CurbFeatureCollection(),
    old_VS_new_selector: false,
    mapclicked: false,
    clickedLong: -73.62756337356329,
    clickedLat: 45.533970387611184,
    description: "",
    b_noBorne: "XXX",
    b_periodes: "",
    b_tarif: 0,
    b_maxStay: 0,
    b_nomRue: "XXX",
    showPopup: false,
    selectedMarker: {},
    showFeedBackPopup: false,
    showEventAlert: false
  };
  
  constructor(props: any) {
    super(props);
    this.hideComponent = this.hideComponent.bind(this);
    this.setArrond =  this.setArrond.bind(this);
    this.setDateTime = this.setDateTime.bind(this);
    // this.onClickMap = this.onClickMap.bind(this);f
    this._mapRef = React.createRef();
  }

  geocoderContainerRef = React.createRef();

  /**
   * Start: Communauto, Electric car chargers, Bixi stations Markers and Popups
   */
  markers = geojson.features.map((marker) =>
    <Marker key={marker.id} longitude={marker.geometry.coordinates[0]} latitude={marker.geometry.coordinates[1]} >
    <img src={marker.image} style={{ backgroundColor: "white", borderRadius: "50%"}} width="20px" height="20px" onClick={() => {this.setState({
      showPopup: true,
      selectedMarker: marker
    })}} />
  </Marker>
  )

  popups = geojson.features.map((marker) =><Popup
  key={marker.id} 
  latitude={marker.geometry.coordinates[0]}
  longitude={marker.geometry.coordinates[1]}
  closeButton={true}
  closeOnClick={false}
  // onClose={() => togglePopup(false)}
  anchor="top" >
    <h3>{marker.geometry.title}</h3>
    <p>{marker.geometry.description}</p>
  </Popup>
  )
  /**
   * End: Communauto, Electric car chargers, Bixi stations Markers and Popups
   */

  _setMapData = (newData: any) => {
    const map = this._getMap();
    map?.getSource("curblrData")?.setData(newData);
  };

  _getMap = () => {
    return this._mapRef ? this._mapRef.current.getMap() : null;
  };

  _loadData() {
    const mapStyle = defaultMapStyle
      // Add geojson source to map
      .setIn(
        ["sources", "curblrData"],
        fromJS({
          type: "geojson",
          data: renderCurblrData(
            this.props.curblr.data,
            this.state.day,
            this.state.time,
            this.state.mode
          )
        })
      )
      // Add point layer to map
      .set("layers", defaultMapStyle.get("layers").push(dataLayer))
      // Add sprite and glyphs to map
      .set("sprite", "mapbox://sprites/emilyeros/ck2zof08b08gu1cllljkqj54m")
      .set("glyphs", "mapbox://fonts/emilyeros/{fontstack}/{range}.pbf");

    this.setState({ mapStyle });
  };
  
  onClickMap(evt) {
    console.log("Clicked Point: ", evt.lngLat);
    var coords = evt.lngLat;
    var description = this.getDescriptionFromCoords(coords)
    this.setState(
      { mapclicked: false,
        clickedLong: coords[0],
        clickedLat: coords[1],
        // b_noBorne: description[0],
        b_nomRue: description[0],
        // b_periodes: description[2],
        b_maxStay: description[2],
        b_tarif: description[1]
        });
  };
 
  getDescriptionFromCoords(coords){
    var geojsonData = (this.state.old_VS_new_selector? this.state.data_to_replace : this.props.curblr.data);
    // var geojsonData = this._getMap().getSource("curblrData")["_data"] //Not the right data to get properties
    console.log("Geojson Data: ", geojsonData)
    console.log("Data: ", )
    const closestPlace   = this.getClosestFeature(coords, geojsonData)
    var Properties     ;
    var assetType      ;
    var sideOfStreet   ;      
    var streetName     ;              
    var Fee            ;
    var maxStay        ;                  
    var timeSpansDays  ;
    var timeSpansDates ;
    try{
      Properties = closestPlace.properties
      assetType = closestPlace.properties.location.assetType
      sideOfStreet = closestPlace.properties.location.sideOfStreet
      streetName = closestPlace.properties.location.streetName
      Fee = closestPlace.properties.regulations[0].payment.rates[0].fees[0]
      maxStay = closestPlace.properties.regulations[0].rule.maxStay
      timeSpansDays =  closestPlace.properties.regulations[0].timeSpans[0].daysOfWeek.days
      timeSpansDates = closestPlace.properties.regulations[0].timeSpans[0].effectiveDates[0]
      console.log("Closest place: ",  closestPlace);
      console.log("Properties: ",     Properties)
      console.log("assetType: ",      assetType)
      console.log("sideOfStreet: ",   sideOfStreet)
      console.log("streetName: ",     streetName)
      console.log("Fee: ",            Fee)
      console.log("maxStay: ",      maxStay)
      console.log("timeSpans: ",    timeSpansDays, timeSpansDates)
    }catch(err) {console.log("error")}

    // var desc = [assetType, sideOfStreet, streetName, Fee, maxStay, timeSpansDates, timeSpansDays]
    var desc = [streetName, Fee, maxStay]
    return desc
  }

  isPointFeature (Feature) {
    return (
        Feature.type === 'Feature'
        && Feature.geometry.type === 'Point'
    );
  }
  
  //https://albertoroura.com/get-closest-feature-featurecollection-given-feature/
  getClosestFeature (coords, FeatureCollection) {
    const lat1 = coords[1];
    const lng1 = coords[0];
    const radLat1 = Math.PI * lat1 / 180;
    const nauticalMileToMile = Math.PI * 60 * 1.1515;

    let lowestValue = 12451; // Earth average longest semicircle
    let closestPlace = null;

    for (const i in FeatureCollection.features) {
        const thisFeature = FeatureCollection.features[i];
        const lng2 = thisFeature.geometry.coordinates[0][0];
        const lat2 = thisFeature.geometry.coordinates[0][1];
        const placeMeta = thisFeature;
        const radLat2 = Math.PI * lat2 / 180;
        const theta = lng1 - lng2;
        const radTheta = Math.PI * theta / 180;

        let dist = Math.sin(radLat1) * Math.sin(radLat2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.cos(radTheta);
        dist = Math.acos(dist) * 180 / nauticalMileToMile;

        if (dist < lowestValue) {
            lowestValue = dist;
            closestPlace = placeMeta;
        }
    }

    return closestPlace;
}

  componentDidMount() {

    this._loadData();

    const map = this._getMap();

    setTimeout(() => {
      this.setState({
        showFeedBackPopup: true
      })
    }, 20000)

    // setTimeout(() => {
    //   this.setState({
    //     showEventAlert: true
    //   })
    // }, 5000)

    window.onresize = () => {
      const { viewport } = this.state;
      this.setState({
        viewport: {
          ...viewport,
          width: window.innerWidth,
          height: window.innerHeight
        }
      });
    };

    this.changeGeoData(geoDataFiles[1]["path"]);
    this.changeGeoData(geoDataFiles[0]["path"]);
  }

  componentWillUnmount() {
    window.onresize = null;
  }

  changeTime = (value: any) => {
    this.setState({ time: value });

    var data = renderCurblrData(
      this.props.curblr.data,
      this.state.day,
      value,
      this.state.mode
    );
    this._setMapData(data);
  };

  changeDay = (value: any) => {
    this.setState({ day: value });

    var data = renderCurblrData(
      this.props.curblr.data,
      value,
      this.state.time,
      this.state.mode
    );
    this._setMapData(data);
  };

  changeMode = (event: any) => {
    this.setState({ mode: event.target.value });

    var data = renderCurblrData(
      this.props.curblr.data,
      this.state.day,
      this.state.time,
      event.target.value
    );
    this._setMapData(data);
  };

  changeGeoData = async (value) => {

    if(value == geoDataFiles[1]["path"])
      this.setState( { paid: true})
    else
      this.setState( { paid: false})

    // this.state.old_VS_new_selector = false;//SetState
    this.setState({old_VS_new_selector: false});
    await this.props.dispatch(curblrActions.fetchGeoData(value));

    var data = renderCurblrData(
      this.props.curblr.data,
      this.state.day,
      this.state.time,
      this.state.mode
    );
    this._setMapData(data);
  };

  changeGeoDataFromPost = async (data_awaited) => {
  
    // this.state.old_VS_new_selector = true;
    this.setState({old_VS_new_selector: true});
    const data_fetched_njson = await data_awaited;
    var data = renderCurblrData(
      data_fetched_njson,
      this.state.day,
      this.state.time,
      this.state.mode
    );
    this._setMapData(data);
  };
 
  hideComponent(name) {
    switch (name) {
      case "showHideCard":
        this.setState({ showHideCard: !this.state.showHideCard });
        break;
      default:
        null;
    }
  };

  setDateTime = (sl_arrondRef) => {
    this.setState({ sl_arrondRef });
    console.log(`Option selected:`, sl_arrondRef.value);
  };
  
  setArrond = (set_dateTimeRef) => {
    this.setState({ set_dateTimeRef });
    console.log(`Option selected:`, set_dateTimeRef.value);
  };

  sendRequest = async () =>{
    let uri = "http://143.198.46.93:8000"; //when remote

    const payload = {
      "true_date_time": this.state.set_dateTimeRef,
      "arrond_quartier": this.state.sl_arrondRef,
      "price": 3,
      "minStay": 32
    }
    
    await axios.post(uri, payload)
      .then((response) => {
      this.setState({data_to_replace:response.data});
      this.changeGeoDataFromPost(response.data);
      }, (error) => {
        console.log(error);
      });
  };

  handleChange = (name, event) => {
    this.setState({
      [name]: event.target.value
    }, () => {
      console.log(this.state.sl_arrondRef);
      console.log(this.state.set_dateTimeRef)
      // Prints the new value.
    });
  };

  CityInfo = (props) => {
    const {info} = props;
    const displayName = `${info.city}, ${info.state}`;
  
    return (
      <div>
        <div>
          {displayName} |{' '}
          <a
            target="_new"
            href={`http://en.wikipedia.org/w/index.php?title=Special:Search&search=${displayName}`}
          >
            Wikipedia
          </a>
        </div>
        <img width={240} src={info.image} />
      </div>
    );
  }

  ControlPanel = () => {
    return (
      <div className="control-panel">
        <h3>Marker, Popup, NavigationControl and FullscreenControl </h3>
        <p>
          Map showing top 20 most populated cities of the United States. Click on a marker to learn
          more.
        </p>
        <p>
          Data source:{' '}
          <a href="https://en.wikipedia.org/wiki/List_of_United_States_cities_by_population">
            Wikipedia
          </a>
        </p>
        <div className="source-link">
          <a
            href="https://github.com/visgl/react-map-gl/tree/6.1-release/examples/controls"
            target="_new"
          >
            View Code ↗
          </a>
        </div>
      </div>
    );
  }

  // Important for perf: the markers never change, avoid rerender when the map viewport changes
  Pins = (props) => {
    const {data, onClick} = props;

    return data.map((city, index) => (
      <Marker key={`marker-${index}`} longitude={city.longitude} latitude={city.latitude}>
        <svg
          height={SIZE}
          viewBox="0 0 24 24"
          style={{
            cursor: 'pointer',
            fill: '#d00',
            stroke: 'none',
            transform: `translate(${-SIZE / 2}px,${-SIZE}px)`
          }}
          onClick={() => onClick(city)}
        >
          <path d={ICON} />
        </svg>
      </Marker>
    ));
  }

  render() {
    const { viewport,
            mapStyle,
            day,
            time,
            mode,
            showHideCard,
            set_dateTimeRef,
            data_to_replace,
            old_VS_new_selector,
            geocoderContainerRef,
            clickedLong,
            clickedLat,
            // description,
            b_noBorne,
            b_periodes,
            b_tarif,
            b_nomRue,
            paid,
            displayPricePopup
          } = this.state;

  // shows everything. would be great if this could intersect the feature collection with the viewport bounding box. i can't figure it out. for kevin?
  const dt_to_set = (old_VS_new_selector? data_to_replace : this.props.curblr.data);
  const features = renderCurblrData(
      dt_to_set,
      this.state.day,
      this.state.time,
      this.state.mode
    );

  // takes CurbLR feed (loaded into map as a prop, above) and puts it into a "dataUri" that can be downloaded from the export button. (Linking to file pathway doesn't work bc of umi build... couldn't find a static location for the data)
    let curblrStr = JSON.stringify(this.props.curblr.data);
    let curblrDataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(curblrStr);
  
    const ACTIVITY_LENGTH_CALC = {
      "no standing": features.features
        .filter(f => f.properties.activity === "no standing")
        .map(f => f.properties.length)
        .reduce((acc, x) => acc + x, 0),
      "no parking": features.features
        .filter(f => f.properties.activity === "no parking")
        .map(f => f.properties.length)
        .reduce((acc, x) => acc + x, 0),
      "passenger loading": features.features
        .filter(f => f.properties.activity === "passenger loading")
        .map(f => f.properties.length)
        .reduce((acc, x) => acc + x, 0),
      "loading": features.features
        .filter(f => f.properties.activity === "loading")
        .map(f => f.properties.length)
        .reduce((acc, x) => acc + x, 0),
      "free parking": features.features
        .filter(f => f.properties.activity === "free parking")
        .map(f => f.properties.length)
        .reduce((acc, x) => acc + x, 0),
      "transit": features.features
        .filter(f => f.properties.activity === "transit")
        .map(f => f.properties.length)
        .reduce((acc, x) => acc + x, 0),
      "paid parking": features.features
        .filter(f => f.properties.activity === "paid parking")
        .map(f => f.properties.length)
        .reduce((acc, x) => acc + x, 0),
      "restricted": features.features
        .filter(f => f.properties.activity === "restricted")
        .map(f => f.properties.length)
        .reduce((acc, x) => acc + x, 0),
      "off street": geojson.features.reduce((total, feature) => 
        (feature.geometry.properties.type === "normal" && !feature.geometry.properties.on_street ) ?
       total + feature.geometry.properties.count : total, 0) * avgParkingLength ,
       "electrique": geojson.features.reduce((total, feature) => 
       (feature.geometry.properties.type === "electrique" ) ?
      total + feature.geometry.properties.count : total, 0) * avgParkingLength,
      "communauto": geojson.features.reduce((total, feature) => 
      (feature.geometry.properties.type === "communauto" ) ?
     total + feature.geometry.properties.count : total, 0) * avgParkingLength 
    };

    const MAXSTAY_LENGTH_CALC = {
      "3": features.features
        .filter(f => Number(f.properties.maxStay) <= 5)
        .map(f => Number(f.properties.length))
        .reduce((acc, x) => acc + x, 0),
      "15": features.features
        .filter(f => Number(f.properties.maxStay) === 15)
        .map(f => Number(f.properties.length))
        .reduce((acc, x) => acc + x, 0),
      "30": features.features
        .filter(f => Number(f.properties.maxStay) === 30)
        .map(f => Number(f.properties.length))
        .reduce((acc, x) => acc + x, 0),
      //"45": features.features.filter(f => f.properties.maxStay === '45').map(f => f.properties.length).reduce((acc, x) => acc + x, 0),
      "60": features.features
        .filter(f => Number(f.properties.maxStay) === 60)
        .map(f => Number(f.properties.length))
        .reduce((acc, x) => acc + x, 0),
      //"90": features.features.filter(f => f.properties.maxStay === '90').map(f => f.properties.length).reduce((acc, x) => acc + x, 0),
      "120": features.features
        .filter(f => Number(f.properties.maxStay) === 120)
        .map(f => Number(f.properties.length))
        .reduce((acc, x) => acc + x, 0),
      "180": features.features
        .filter(f => Number(f.properties.maxStay) === 180)
        .map(f => Number(f.properties.length))
        .reduce((acc, x) => acc + x, 0),
      "240": features.features
        .filter(f => Number(f.properties.maxStay) >= 240)
        .map(f => Number(f.properties.length))
        .reduce((acc, x) => acc + x, 0)
      //  "360": features.features.filter(f => f.properties.maxStay === '360').map(f => f.properties.length).reduce((acc, x) => acc + x, 0),
      //  "480": features.features.filter(f => f.properties.maxStay === '480').map(f => f.properties.length).reduce((acc, x) => acc + x, 0),
    };

    const activityPieData = [
      {
        x: formatMessage(
          {
            id: isMobile ? 'Stationnement_gratuit_mobile' : 'Stationnement_gratuit',
          }),
        y: ACTIVITY_LENGTH_CALC["free parking"]
      },
      {
        x: formatMessage(
          {
            id: isMobile ? 'Stationnement_payant_mobile' : 'Stationnement_payant',
          }),
        y: ACTIVITY_LENGTH_CALC["paid parking"]
      },
      {
        x: formatMessage(
          {
            id: 'Arret_interdit',
          }),
        y: ACTIVITY_LENGTH_CALC["no standing"]
      },
      {
        x: formatMessage(
          {
            id: isMobile ? 'Stationnement_interdit_mobile' : 'Stationnement_interdit',
          }),
        y: ACTIVITY_LENGTH_CALC["no parking"]
      },
      {
        x: formatMessage(
          {
            id: 'Taxis_autres',
          }),
        y: ACTIVITY_LENGTH_CALC["passenger loading"]
      },
      {
        x: formatMessage(
          {
            id: 'Debarcaderes',
          }),
        y: ACTIVITY_LENGTH_CALC["loading"]
      },
      // {
      //   x: formatMessage(
      //     {
      //       id: 'Transit',
      //     }),
      //   y: ACTIVITY_LENGTH_CALC["transit"]
      // },
      {
        x: formatMessage(
          {
            id: 'Autres_restrictions',
          }),
        y: ACTIVITY_LENGTH_CALC["restricted"]
      },
      {
        x: formatMessage(
          {
            id: 'Stationnements_hors_rue',
          }),
        y: ACTIVITY_LENGTH_CALC["off street"]
      },
      {
        x: formatMessage(
          {
            id: 'Circuit_electrique',
          }),
        y: ACTIVITY_LENGTH_CALC["electrique"]
      },
      {
        x: formatMessage(
          {
            id: 'Communauto',
          }),
        y: ACTIVITY_LENGTH_CALC["communauto"]
      }
    ];

    const maxStayPieData = [
      {
        x: "5 min or less",
        y: MAXSTAY_LENGTH_CALC["3"]
      },
      {
        x: "15 min",
        y: MAXSTAY_LENGTH_CALC["15"]
      },
      {
        x: "30 min",
        y: MAXSTAY_LENGTH_CALC["30"]
      },
      // {
      //   x: '45 min',
      //   y: MAXSTAY_LENGTH_CALC['45'],
      // },
      {
        x: "1 hr",
        y: MAXSTAY_LENGTH_CALC["60"]
      },
      // {
      //   x: '90 min',
      //   y: MAXSTAY_LENGTH_CALC['90'],
      // },
      {
        x: "2 hr",
        y: MAXSTAY_LENGTH_CALC["120"]
      },
      {
        x: "3 hr",
        y: MAXSTAY_LENGTH_CALC["180"]
      },
      {
        x: "4 hr or more",
        y: MAXSTAY_LENGTH_CALC["240"]
      }
    ];
 
    return (
      <Layout>  
        <Content>
          <MapGL
            ref={this._mapRef}
            mapboxApiAccessToken={mapboxAccessToken}
            mapStyle={mapStyle}
            {...viewport}
            onViewportChange={(viewport) => this.setState({ viewport })}
            onClick={(evt) => {this.onClickMap(evt); this.setState({displayPricePopup: true})}}
          >
          {this.state.paid && this.state.displayPricePopup &&
          <Popup
            latitude={clickedLat}
            longitude={clickedLong}
            closeButton={true}
            closeOnClick={true}
            onClose={() => this.setState({displayPricePopup: false})}
            anchor="top" >
            <div>Rue: {b_nomRue}</div>
            <br />
            <div><FormattedMessage id="Tarif_horaire" />: {b_tarif} dollars</div>
            <br />            
          </Popup>}

          {this.markers}
          </MapGL>
          <div
            ref={geocoderContainerRef}
            style={{ position: "absolute", top: 20, left: 20, zIndex: 1 }}
          />
        </Content>
        
        {this.state.showPopup && <Card
          size="small"
          title={
            <div style={{ display: "flex", cursor: "pointer", justifyContent: "space-between"}} onClick={() => this.setState({showPopup: !this.state.showPopup})}>
              <p><img src={this.state.selectedMarker.image} width="25px" style={{ marginRight: "1rem"}} />{this.state.selectedMarker.geometry.properties.title}</p>
              <div ><AiOutlineClose /></div>
            </div>
            }
          bordered={true}
          style={{
            position: "fixed",
            top: isMobile ? "130px" : "60px",
            right: isMobile ? "0" : "20px",
            width: isMobile ? "100%" : "400px",
            height: "400px",
            maxHeight: "100vh",
            overflow: "auto",
          }}
        ><div>
          <p>{this.state.selectedMarker.geometry.properties.description}</p>
          <p><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Parking_icon.svg/1024px-Parking_icon.svg.png" width="25px" /> {this.state.selectedMarker.geometry.properties.count} places</p>
          {this.state.selectedMarker.geometry.properties.type === "normal" && <p><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/MUTCD_D9-6.svg/1024px-MUTCD_D9-6.svg.png" width="25px"/> {this.state.selectedMarker.geometry.properties.handicapped_count} <FormattedMessage id="handicapped_places" /></p>}
          {this.state.selectedMarker.geometry.properties.type === "normal" && <p>{this.state.selectedMarker.geometry.properties.regulation}: {this.state.selectedMarker.geometry.properties.price_per_hour} $CA /<FormattedMessage id="heure" /></p>}
          {this.state.selectedMarker.geometry.properties.type === "normal" && <p>{this.state.selectedMarker.geometry.properties.regulation}: {this.state.selectedMarker.geometry.properties.price_per_day} $CA /<FormattedMessage id="day" /></p>}
          <p>{this.state.selectedMarker.geometry.properties.address}</p>
          <p><a href={"https://www.google.com/maps/search/?api=1&query=" + this.state.selectedMarker.geometry.coordinates[1].toString() + "," + this.state.selectedMarker.geometry.coordinates[0].toString()} ><AiOutlinePushpin /> <FormattedMessage id="go_to_this_place" /></a></p>
          {/* {this.state.selectedMarker.geometry.properties.img !== null && <img src={require(this.state.selectedMarker.geometry.properties.img)} width="100%" />} */}
        </div></Card>}


        <Card
          size="small"
          title={
            <div style={{ display: "flex", cursor: "pointer", justifyContent: "space-between"}} onClick={() => this.hideComponent("showHideCard")} >
              <p><FormattedMessage id="STATIONNEMENTS_PLAZA_SAINT_HUBERT" /></p>
              <div style={{ marginLeft: "1rem", }} >{showHideCard ? <AiFillCaretDown /> : <AiFillCaretUp />}</div>
            </div>
            }
          bordered={true}
          style={{
            position: "fixed",
            top: isMobile ? "75px": "10px",
            left: isMobile ? "0" : "50px",
            width: isMobile ? "100%" : "400px",
            height: showHideCard ? "auto" : "40px",
            maxHeight: "100vh",
            overflow: "auto",
          }}
        >
          
          <div><FormattedMessage id="DONNEES_A_AFFICHER"/></div>
          <Select
            defaultValue={geoDataFiles[0]["path"]} 
            onChange={this.changeGeoData}
            style={{
              margin: "0.1rem",
              width: "100%",
            }}
          >
            {React.Children.toArray(
              geoDataFiles.map((f) => (
                <Select.Option value={f.path}>{f.label}</Select.Option>
              ))
            )}
          </Select>
          <Select 
            defaultValue={day} 
            onChange={this.changeDay}
            style={{
              margin: "0.05rem",
              width: isMobile ? "100%" : "49.5%",
            }}
          >
            <Select.Option value="mo"><FormattedMessage id="Monday" /></Select.Option>
            <Select.Option value="tu"><FormattedMessage id="Tuesday" /></Select.Option>
            <Select.Option value="we"><FormattedMessage id="Wednesday" /></Select.Option>
            <Select.Option value="th"><FormattedMessage id="Thursday" /></Select.Option>
            <Select.Option value="fr"><FormattedMessage id="Friday" /></Select.Option>
            <Select.Option value="sa"><FormattedMessage id="Saturday" /></Select.Option>
            <Select.Option value="su"><FormattedMessage id="Sunday" /></Select.Option>
          </Select>
          <Select
            defaultValue={time}
            onChange={this.changeTime}
            style={{
              margin: "0.05rem",
              width: isMobile ? "100%" : "49.5% ",
            }}
          >
            <Select.Option value="00:01">00:00</Select.Option>
            <Select.Option value="01:01">01:00</Select.Option>
            <Select.Option value="02:01">02:00</Select.Option>
            <Select.Option value="03:01">03:00</Select.Option>
            <Select.Option value="04:01">04:00</Select.Option>
            <Select.Option value="05:01">05:00</Select.Option>
            <Select.Option value="06:01">06:00</Select.Option>
            <Select.Option value="07:01">07:00</Select.Option>
            <Select.Option value="08:01">08:00</Select.Option>
            <Select.Option value="09:01">09:00</Select.Option>
            <Select.Option value="10:01">10:00</Select.Option>
            <Select.Option value="11:01">11:00</Select.Option>
            <Select.Option value="12:01">12:00</Select.Option>
            <Select.Option value="13:01">13:00</Select.Option>
            <Select.Option value="14:01">14:00</Select.Option>
            <Select.Option value="15:01">15:00</Select.Option>
            <Select.Option value="16:01">16:00</Select.Option>
            <Select.Option value="17:01">17:00</Select.Option>
            <Select.Option value="18:01">18:00</Select.Option>
            <Select.Option value="19:01">19:00</Select.Option>
            <Select.Option value="20:01">20:00</Select.Option>
            <Select.Option value="21:01">21:00</Select.Option>
            <Select.Option value="22:01">22:00</Select.Option>
            <Select.Option value="23:01">23:00</Select.Option>
          </Select>
          <Radio.Group
            defaultValue={mode}
            buttonStyle="solid"
            onChange={this.changeMode}
            style={{
              marginTop: "1rem",
              marginBottom: "1rem",
              width: "100%",
            }}
          >
            <Radio.Button 
              style={{
                width: "50%",
              }} 
              value="activity"><FormattedMessage id="Activity" /></Radio.Button>
            <Radio.Button 
              style={{
                width: "50%",
              }}  value="maxStay"><FormattedMessage id="Maxstay" /></Radio.Button>
          </Radio.Group>
          {mode === "maxStay" ? (
            <Pie
              animate={false}
              colors={Object.values(MAXSTAY_COLOR_MAP)}
              hasLegend
              title={<FormattedMessage id="Maxstay" />}
              subTitle={
                <>
                  {isMobile ? <FormattedMessage id="Totalcarlenghts_mobile" /> : <FormattedMessage id="Totalcarlenghts" />}
                </>
              }
              total={() => (
                <>
                  <span>
                    {(
                      maxStayPieData.reduce((pre, now) => now.y + pre, 0) /
                      avgParkingLength
                    ).toLocaleString("en", {
                      style: "decimal",
                      maximumFractionDigits: 0,
                      minimumFractionDigits: 0,
                    })}
                  </span>
                </>
              )}
              data={maxStayPieData}
              valueFormat={(val) => (
                <span>
                  {(val / avgParkingLength).toLocaleString("en", {
                    style: "decimal",
                    maximumFractionDigits: 0,
                    minimumFractionDigits: 0,
                  })}{" "}
                  <FormattedMessage id="places" />
                </span>
              )}
              height={240}
            />
          ) : (
            <Pie
              animate={false}
              colors={Object.values(ACTIVITY_COLOR_MAP)}
              hasLegend
              title="Activities"
              subTitle={
                <>
                  {isMobile ? <FormattedMessage id="Totalcarlenghts_mobile" /> : <FormattedMessage id="Totalcarlenghts" />}
                </>
              }
              total={() => (
                <>
                  <span>
                    {(
                      (activityPieData.reduce((pre, now) => now.y + pre, 0) /
                      avgParkingLength
                    )
                    ).toLocaleString("en", {
                      style: "decimal",
                      maximumFractionDigits: 0,
                      minimumFractionDigits: 0,
                    })}
                  </span>
                </>
              )}
              data={activityPieData}
              valueFormat={(val) => (
                <span>
                  {(val / avgParkingLength).toLocaleString("en", {
                    style: "decimal",
                    maximumFractionDigits: 0,
                    minimumFractionDigits: 0,
                  })}
                  <FormattedMessage id="places" />
                </span>
              )}
              height={240}
            />
          )}
          <br />
          <Button
            type="default"
            icon="plus"
            block
            href={getLocale() === 'en-US' ? "https://docs.google.com/forms/d/e/1FAIpQLSf1v6KRZhsh-CvjUjtWaPusWWYXGqxfjhUTkrCosu8CjJZ1rQ/viewform?usp=sf_link" : "https://docs.google.com/forms/d/e/1FAIpQLScVODNR4kBni0rLRlyyMrsHl8RtYHopsSH5AjrkP4H5SktRiQ/viewform?usp=sf_link"}
          >
            <FormattedMessage id="DONNEZ_NOUS_VOTRE_AVIS" />
          </Button>
          <br />
          <br />
          <Button
            type="primary"
            icon="download"
            block
            href={curblrDataUri}
            download="export.curblr.json"
          >
            <FormattedMessage id="Download_curblr_data" />
          </Button>
          <br />
          <br />
          {isMobile && <Button
            type="default"
            icon="plus"
            block
          >
            <Link to="/consent"><FormattedMessage id="cgu_link" /></Link>
          </Button>}
          <br />
          <br />
          {isMobile && <Button
            type="default"
            href="https://wiki.lafabriquedesmobilites.fr/wiki/Carte_CurbLR_de_Montr%C3%A9al"
            icon="plus"
            block
          >
            <FormattedMessage id="More_information_about_the_card" />
          </Button>}
          <p style={{ "fontSize": "11px" }}>
            <a href="https://donnees.montreal.ca/ville-de-montreal/stationnement-sur-rue-signalisation-courant">
              <FormattedMessage id="donnees_stationnement_montreal" />
            </a>
          </p>
        </Card>
    
        {this.state.showFeedBackPopup && <Card
          size="small"
          title={
          <div style={{ display: "flex", cursor: "pointer", justifyContent: "flex-end"}} onClick={() => this.setState({showFeedBackPopup: false})}>
            <div ><AiOutlineClose /></div>
          </div>}
          bordered={false}
          style={{
            position: "fixed",
            left: isMobile ? "0" : "41%",
            top: isMobile ? "75px": "10px",
            width: isMobile ? "100%" : "400px",
            height: "800px",
            maxHeight: "100vh",
            overflow: "auto",
          }}
        >
          {getLocale() === 'en-US' ? 
          <iframe src="https://docs.google.com/forms/d/e/1FAIpQLScVODNR4kBni0rLRlyyMrsHl8RtYHopsSH5AjrkP4H5SktRiQ/viewform?embedded=true" width="380" height="700" frameBorder="0" marginHeight="0" marginWidth="0">Loading…</iframe> :
          <iframe src="https://docs.google.com/forms/d/e/1FAIpQLSf1v6KRZhsh-CvjUjtWaPusWWYXGqxfjhUTkrCosu8CjJZ1rQ/viewform?embedded=true" width="380" height="700" frameBorder="0" marginHeight="0" marginWidth="0">Loading…</iframe>}
        </Card>}

        {this.state.showEventAlert && <Card
          size="small"
          title={
          <div style={{ display: "flex", cursor: "pointer", justifyContent: "space-between"}} onClick={() => this.setState({showEventAlert: false})}>
            <div><AiFillWarning /></div>
            <div><FormattedMessage id="event_alert_title"/></div>
            <div><AiOutlineClose /></div>
          </div>}
          bordered={false}
          style={{
            position: "fixed",
            left: isMobile ? "0" : "40%",
            top: isMobile ? "75px": "10px",
            width: isMobile ? "100%" : "450px",
            height: "300px",
            maxHeight: "100vh",
            overflow: "auto",
            color: "white",
            backgroundColor: "#E76A4C"
          }}
        >
          <div>
            <h3><FormattedMessage id='event_alert_subtitle' /></h3>
            <h3><FormattedMessage id='event_alert_subtitle2' /></h3>
            <ul>
              <li><FormattedMessage id='event_alert_title_list_element_1' /></li>
              <li><FormattedMessage id='event_alert_title_list_element_2' /></li>
            </ul>
          </div>
        </Card>}

        <Card
          size="small"
          title=""
          bordered={true}
          style={{
            position: "fixed",
            right: "10px",
            top: "10px",
            height: "60px",
            overflow: "auto",
            backgroundColor: "transparent",
            border: "none",
            display: "flex", 
            cursor: "pointer" 
          }}
        >
        <Button type={getLocale() === 'en-US' ? "primary" : "default"} style={{marginRight: "0.1rem"}} onClick={(e) => {e.preventDefault(); setLocale('en-US')}}>EN</Button><Button type={getLocale() === 'fr-FR' ? "primary" : "default"} style={{marginLeft: "0.1rem"}} onClick={(e) => {e.preventDefault(); setLocale('fr-FR')}}>FR</Button>
        </Card>

        <CookieConsent
          location="bottom"
          buttonText={<FormattedMessage id='i_consent' />}
          cookieName="cookieConsent"
          style={{ backgroundColor: "#000000", color: "#ffffff" }}
          buttonStyle={{ color: "#4e503b", fontSize: "13px" }}
          expires={150}
        >
          <FormattedMessage id='cookie_consent_text'/>{" "}
          <span style={{ fontSize: "10px" }}><Link to="/consent"><FormattedMessage id="cookie_consent_read_more" /></Link></span>
        </CookieConsent>
        {!isMobile && <Button
          size="small"
          type="primary"
          style={{
            position: "fixed",
            bottom: "80px",
            right: "40px",
          }}
        >
          <Link to="/consent"><FormattedMessage id="cgu_link" /></Link>
        </Button>}
        {!isMobile && <Button
          size="small"
          type="primary"
          href="https://wiki.lafabriquedesmobilites.fr/wiki/Carte_CurbLR_de_Montr%C3%A9al"
          style={{
            position: "fixed",
            bottom: "40px",
            right: "40px",
          }}
        >
          <FormattedMessage id="More_information_about_the_card" />
        </Button>}

      </Layout>
    )
    
  }
}

export default connect(mapStateToProps)(Map);
