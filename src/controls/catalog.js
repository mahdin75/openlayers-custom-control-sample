import { Control } from 'ol/control';
import WMSCapabilities from 'ol/format/WMSCapabilities';
import { Cluster, Vector as VectorSource, TileWMS } from 'ol/source';
import { Tile, Vector as VectorLayer } from 'ol/layer';
// const {
//     OWS_1_1_0,
//     Filter_2_0,
//     WFS_2_0
// } = require('ogc-schemas');

// const {XLink_1_0} = require('w3c-schemas');
// const {Jsonix} = require('jsonix');

// const mappings_wfs_2_0_0 = [XLink_1_0, OWS_1_1_0, Filter_2_0, WFS_2_0];


class Catalog extends Control {
    constructor(props) {
        const button = document.createElement('button');
        button.innerHTML = 'C';
        const element = document.createElement('div');
        element.className = 'catalog-control ol-unselectable ol-control';
        element.appendChild(button);
        super({ element });

        const self = this;
        button.onclick = function(e) {
            self.showPopup();
        }

    }

    search(url) {
        let urlSplit = url.split("/");
        if (urlSplit.length <= 0) {
            return 0;
        }
        const serviceType = urlSplit[urlSplit.length - 1];
        if (serviceType !== "wms") {
            alert("onely wms get capability is supported!");
        }
        let parser;
        const target = document.body.querySelector('.search-layer-result');
        target.innerHTML = 'Loding...'
        fetch(`${url}?request=GetCapabilities&${serviceType==="wfs"?"AcceptFormats=application/json":""}`).then(data => {
            return data.text()
        }).then(text => {
            let result;
            if (serviceType === "wms") {
                parser = new WMSCapabilities();
                result = parser.read(text);
            } else {
                // const context_wfs_2_0_0 = new Jsonix.Context(mappings_wfs_2_0_0);
                // const unmarshaller_wfs_2_0_0 = context_wfs_2_0_0.createUnmarshaller();
                // result = unmarshaller_wfs_2_0_0.unmarshalString(text)
                result = text;
            }
            let resultHTML = `<select class="service-layers" name="service-layers" multiple>`
            result.Capability.Layer.Layer.forEach(layer => {
                console.log(layer)
                resultHTML += `<option data-extent="${layer.EX_GeographicBoundingBox}" value="${layer.Name}">${layer.Title}</option>`;
            });
            resultHTML += `</select>`
            target.innerHTML = resultHTML;
        }).catch(e => {
            console.log(e)
            target.innerHTML = 'error!'
        })
    }
    addLayerToMap(option, url, gbbox) {
        this.getMap().addLayer(
            new Tile({
                source: new TileWMS({
                    url,
                    params: { 'LAYERS': option.value, 'TILED': true },
                    serverType: 'geoserver',
                    transition: 0
                }),
                title: option.innerHTML,
                visible: true,
                sourceType: 'WMS',
                gbbox: gbbox
            })
        );
    }
    showPopup() {
        const self = this;
        const popupDiv = document.createElement("div");
        popupDiv.className = "popup";
        const urlServiceBox = document.createElement("input");
        urlServiceBox.setAttribute('type', 'url');
        urlServiceBox.setAttribute('placeholder', 'Service URL');

        const searchLayersBtn = document.createElement("button");
        searchLayersBtn.appendChild(document.createTextNode("Search"));
        searchLayersBtn.onclick = function(evt) {
            self.search(urlServiceBox.value);
        }

        const popupHeader = document.createElement("h3");
        popupHeader.appendChild(document.createTextNode("Search Layer"));

        const searchResultBox = document.createElement("div");
        searchResultBox.className = "search-layer-result";

        const addLayerBtn = document.createElement("button");
        addLayerBtn.appendChild(document.createTextNode("Add To Layers"));
        addLayerBtn.onclick = function() {
            const selectElement = document.querySelector('.service-layers');
            for (var option of selectElement.options) {
                if (option.selected) {
                    self.addLayerToMap(option, urlServiceBox.value, option.getAttribute("data-extent"));
                }
            }
            document.body.removeChild(document.body.querySelector(".popup"));
            self.getMap().getControls().getArray()[4].toggleLayerPanel();
            self.getMap().getControls().getArray()[4].toggleLayerPanel();
        }

        const closeBtn = document.createElement("button");
        closeBtn.appendChild(document.createTextNode("Cancel"));
        closeBtn.onclick = function(evt) {
            document.body.removeChild(document.body.querySelector(".popup"));
        }
        closeBtn.style.backgroundColor = '#5e0008';

        const popupDivInner = document.createElement("div");
        popupDivInner.className = "popup-inner";

        popupDivInner.appendChild(popupHeader);
        popupDivInner.appendChild(searchLayersBtn);
        popupDivInner.appendChild(urlServiceBox);
        popupDivInner.appendChild(searchResultBox);
        popupDivInner.appendChild(addLayerBtn);
        popupDivInner.appendChild(closeBtn);

        popupDiv.appendChild(popupDivInner);

        document.body.appendChild(popupDiv);
    }
}

export default Catalog;