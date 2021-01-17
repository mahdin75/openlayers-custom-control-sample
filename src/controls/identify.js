import { Control } from 'ol/control';
import { unByKey } from 'ol/Observable';


class Identify extends Control {
    constructor(props) {
        const button = document.createElement('button');
        button.innerHTML = 'i';
        const element = document.createElement('div');
        element.className = 'identify-control ol-unselectable ol-control';
        element.appendChild(button);
        super({ element });
        this.state = {
            active: false,
            onClickEventKey: undefined,
            results: []
        }
        const self = this;
        button.onclick = function(e) {
            self.state.active = !self.state.active;
            if (self.state.active) {
                button.classList.add('active-control');
                self.state.onClickEventKey = self.getMap().on('click', function(evt) {
                    document.body.style.cursor = 'wait';
                    self.doIdentify(evt.coordinate, evt.pixel).then(result => {
                        props.showResultTable(result);
                        document.body.style.cursor = 'unset';
                    });
                })
            } else {
                button.classList.remove('active-control');
                unByKey(self.state.onClickEventKey);
            }
        }
    }
    doIdentify(coords, pixel) {
        const self = this;
        this.state.results = [];
        return new Promise((resolve, reject) => {
            const layers = self.getMap().getLayers().getArray();
            const identifyPromises = [];
            layers.forEach(layer => {
                if (layer.get('visible')) {
                    let p;
                    switch (layer.get('sourceType')) {
                        case 'WMS':
                            p = self.wmsIdentify(layer, coords);
                            break;
                        case 'Vector':
                            p = self.vectorIdentify(layer, pixel);
                            break;
                        default:
                            break;
                    }
                    identifyPromises.push(p);
                }
            })
            Promise.all(identifyPromises).then(() => resolve(self.state.results));
        });
    }
    wmsIdentify(layer, coords) {
        const self = this;
        const viewResolution = this.getMap().getView().getResolution();
        return new Promise((resolve, reject) => {
            const url = layer.getSource().getFeatureInfoUrl(
                coords,
                viewResolution,
                'EPSG:3857', { 'INFO_FORMAT': 'application/json' }
            );
            return fetch(url).then(function(response) {
                    return response.json();
                })
                .then(function(response) {
                    const features = response.features;
                    let attributeData = [];
                    features.forEach(f => {
                        attributeData.push(f.properties);
                    });
                    if (attributeData.length > 0) {
                        self.state.results.push({
                            layerTitle: layer.get('title'),
                            attributeData
                        });
                    }
                    resolve();
                })
        });
    }
    vectorIdentify(layer, pixel) {
        const self = this;
        return new Promise((resolve, reject) => {
            let attributeData = [];
            self.getMap().forEachFeatureAtPixel(pixel, (fs, l) => {
                if (l === layer) {
                    const features = fs.values_.features;
                    features.forEach(f => {
                        const row = JSON.parse(JSON.stringify(f.values_));
                        delete row['geometry'];
                        attributeData.push(row);
                    });
                }
            });
            if (attributeData.length > 0) {
                self.state.results.push({
                    layerTitle: layer.get('title'),
                    attributeData
                });
            }
            resolve();
        });
    }
}

export default Identify;