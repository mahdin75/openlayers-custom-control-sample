import App from './app';

//TODO: one base layer should be shown on the map
//TODO: container should be independant
//TODO: style and imgages should be based on BEM or be independant

//TODO: layer legend:  
//http://localhost:8085/geoserver/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LAYER=topp:states

//TODO: layer settings
//TODO: WfS Get Capability is not supproted  
//TODO: make it more component based
//TODO: Zoom To Extent  
const app = new App({
    rootId: "map",
    view: {
        zoom: 7,
        center: [51.6, 32.6]
    },
    defaultLayers: [{
            base: true,
            type: "OSM",
            title: "OpenStreetMap",
            visible: true
        },
        {
            base: false,
            type: "WMS",
            title: "جاده های های ایران - WMS",
            visible: true,
            url: 'http://194.5.195.215:8080/geoserver/wms',
            typename: 'geonode:iran_roads',
            serverType: 'geoserver',
            bbox: "45.343083607583814,25.87553558146939,60.72475357068331,38.43886992035895"
        },
        {
            base: false,
            type: "WFS",
            title: "شهر های ایران - WFS",
            visible: true,
            url: "http://194.5.195.215:8080/geoserver/wfs",
            typename: "geonode:iran_states",
            srsname: "EPSG:3857",
            bbox: "45.343083607583814,25.87553558146939,60.72475357068331,38.43886992035895"
        }
    ]
});

app.render();