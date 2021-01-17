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
        zoom: 4,
        center: [-90, 40]
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
            title: "USA States(WMS)",
            visible: true,
            url: 'https://ahocevar.com/geoserver/wms',
            typename: 'topp:states',
            serverType: 'geoserver'
        },
        {
            base: false,
            type: "WFS",
            title: "ne_10m_populated_p(WFS)",
            visible: true,
            url: "https://ahocevar.com/geoserver/wfs",
            typename: "ne:ne_10m_populated_places",
            srsname: "EPSG:3857"
        }
    ]
});

app.render();