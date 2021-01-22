import { Map, View } from 'ol';
import { OSM, Cluster, Vector as VectorSource, TileWMS } from 'ol/source';
import { Tile, Vector as VectorLayer } from 'ol/layer';
import { Fill, Stroke, Circle, Style } from 'ol/style';
import { FullScreen, ScaleLine, MousePosition, Zoom } from 'ol/control';

import { createStringXY } from 'ol/coordinate';
import { GeoJSON } from 'ol/format';
import { fromLonLat } from 'ol/proj';
import { bbox as bboxStrategy } from 'ol/loadingstrategy';
import 'ol/ol.css';

//custom control imports
import Identify from './controls/identify';
import Catalog from './controls/catalog';
import LayerSwitcher from './controls/layer-switcher';

//global style
import './style.css';

class App {
    constructor(props) {
        this.state = {
            rootId: props.rootId,
            defaultView: props.view,
            defaultLayers: props.defaultLayers
        }
    }

    addMap(target) {
        this.map = new Map({
            target,
            controls: [new FullScreen(), new Zoom()]
        });
    }

    setView({ zoom, center }) {
        this.map.setView(
            new View({
                zoom,
                center: fromLonLat(center)
            })
        )
    }

    addLayer(layerState) {
        switch (layerState.type) {
            case "OSM":
                this.map.addLayer(
                    new Tile({
                        source: new OSM(),
                        title: layerState.title,
                        type: 'base',
                        visible: layerState.visible,
                        sourceType: 'OSM'
                    })
                )
                break;
            case "WMS":
                this.map.addLayer(
                    new Tile({
                        source: new TileWMS({
                            url: layerState.url,
                            params: { 'LAYERS': layerState.typename, 'TILED': true },
                            serverType: layerState.serverType,
                            transition: 0
                        }),
                        title: layerState.title,
                        visible: layerState.visible,
                        type: layerState.base ? 'base' : '',
                        sourceType: 'WMS',
                        gbbox: layerState.bbox,
                    })
                )
                break;
            case "WFS":
                const vectorSource = new Cluster({
                    distance: 40,
                    source: new VectorSource({
                        format: new GeoJSON(),
                        url: function(extent) {
                            return (
                                layerState.url +
                                '?service=WFS&version=1.1.0&request=GetFeature&typename=' +
                                layerState.typename +
                                '&outputFormat=application/json&srsname=' +
                                layerState.srsname +
                                '&bbox=' +
                                extent.join(',') +
                                ',EPSG:3857'
                            );
                        },
                        strategy: bboxStrategy,
                    })
                });
                this.map.addLayer(
                    new VectorLayer({
                        source: vectorSource,
                        title: layerState.title,
                        visible: layerState.visible,
                        type: layerState.base ? 'base' : '',
                        style: new Style({
                            image: new Circle({
                                fill: new Fill({
                                    color: '#fff'
                                }),
                                stroke: new Stroke({
                                    color: '#000',
                                    width: 1.25
                                }),
                                radius: 5
                            })
                        }),
                        sourceType: 'Vector',
                        gbbox: layerState.bbox,

                    })
                )
                break;
            default:
                console.log("this layers is not supported yet");
                break;
        }
    }

    render() {
        const self = this;

        //create map
        const divMap = document.createElement('div');
        divMap.setAttribute("id", this.state.rootId);
        document.body.appendChild(divMap);
        this.addMap(this.state.rootId);
        this.setView(this.state.defaultView);

        //add Layers
        this.state.defaultLayers.map(item => this.addLayer(item));

        //add controls
        this.map.addControl(new MousePosition({
            coordinateFormat: createStringXY(4),
            projection: 'EPSG:4326'
        }));
        this.map.addControl(new ScaleLine());

        this.map.addControl(new LayerSwitcher());
        this.map.addControl(new Identify({
            showResultTable: self.showResultTable
        }));
        this.map.addControl(new Catalog());
    }

    showResultTable(results) {
        let resultTable = document.getElementById("identify-table");
        if (!document.contains(resultTable)) {
            resultTable = document.createElement('div');
            resultTable.setAttribute('id', 'identify-table');
            document.body.appendChild(resultTable);
        }
        resultTable.innerHTML = '';

        results.forEach((item, index) => {
            const layerTitle = item.layerTitle;
            const attributeData = item.attributeData;

            var k = `<p style='margin:10px;font-weight:bolder'>${layerTitle}</p>
            <table class="styled-table">`;
            for (const property in attributeData[0]) {
                k += '<th>' + property + '</th>';
            }
            k += '<tbody>';
            for (let i = 0; i < attributeData.length; i++) {
                k += '<tr>';
                for (const property in attributeData[i]) {
                    k += '<td>' + attributeData[i][property] + '</td>';
                }
                k += '</tr>';
            }
            k += '</tbody></table>';

            const tableWrapper = document.createElement('div');
            tableWrapper.innerHTML = k;

            resultTable.appendChild(tableWrapper);
        });
        if (results.length === 0) {
            document.body.removeChild(resultTable);
        }


    }
}

export default App;