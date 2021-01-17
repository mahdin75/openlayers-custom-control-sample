import { Control } from 'ol/control';

class LayerSwitcher extends Control {
    constructor(props) {
        const button = document.createElement('button');
        const element = document.createElement('div');
        element.className = 'layer-switcher ol-unselectable ol-control';
        element.appendChild(button);

        super({ element });
        //super should be called first 
        const self = this;

        button.onclick = function(e) {
            self.toggleLayerPanel();
        }

        this.state = {
            layers: [],
            showPanel: false
        }

    }
    toggleLayerPanel() {
        if (this.state.showPanel === false) {
            this.renderPanel();
            this.state.showPanel = true;
        } else {
            document.body.removeChild(document.querySelector(".layer-panel"));
            this.state.showPanel = false;
        }
    }

    handleLayerChange(layerIndex) {
        const layers = this.getMap().getLayers().getArray();
        return function(evt) {
            layers.forEach((layer, index) => {
                if (index === layerIndex) {
                    layer.set('visible', evt.target.checked);
                }
            })
        }
    }

    zoomHandler(layer) {
        const map = this.getMap();
        return function(evt) {
            console.log(layer.getExtent() || layer.getSource().getExtent());
            map.getView().fit(layer.getExtent(), map.getSize());
        }
    }

    settingLayerHandler(layer) {
        const self = this;
        const map = this.getMap();
        return function(evt) {
            let c = window.confirm("Do you realy want to remove this layer?");
            if (c) {
                map.removeLayer(layer);
                self.toggleLayerPanel();
                self.toggleLayerPanel();
            }
        }
    }

    renderPanel() {

        //add panel
        const panel = document.createElement('div');
        panel.className = 'layer-panel';
        const map = this.getMap();
        document.body.insertBefore(panel, map.getTargetElement());

        //header
        const heading = document.createElement("h2");
        heading.appendChild(document.createTextNode("Layers"))
        panel.appendChild(heading);
        panel.appendChild(document.createElement("hr"))

        const baseLayers = document.createElement('div');
        const baseLayerHeading = document.createElement("h3");
        baseLayerHeading.appendChild(document.createTextNode("Base Layers"))
        baseLayers.appendChild(baseLayerHeading);

        const thematicLayers = document.createElement('div');
        const thematicLayersHeading = document.createElement("h3");
        thematicLayersHeading.appendChild(document.createTextNode("Thematic Layers"))
        thematicLayers.appendChild(thematicLayersHeading);

        panel.appendChild(thematicLayers);
        panel.appendChild(baseLayers);
        //render layers to panel
        const layers = map.getLayers().getArray();
        layers.forEach((layer, index) => {
            const input = document.createElement('input');
            if (layer.get('visible') === true) {
                input.checked = true;
            }
            input.setAttribute('id', `layer-${index}`);
            const label = document.createElement('label');
            label.setAttribute('for', `layer-${index}`);
            label.innerHTML = layer.get('title');

            const layerItem = document.createElement("div");
            layerItem.className = 'layer-panel__layer-item';


            if (layer.get('type') === 'base') {
                input.setAttribute('type', 'radio');
                input.setAttribute('name', 'base');

                layerItem.appendChild(input);
                layerItem.appendChild(label);

                baseLayers.appendChild(layerItem);
            } else {
                input.setAttribute('type', 'checkbox');
                input.setAttribute('name', `layer-${index}`);

                // const zoomIcon = document.createElement('img');
                // zoomIcon.className = "zoom-icon";
                // layerItem.appendChild(zoomIcon);
                // zoomIcon.onclick = this.zoomHandler(layer);

                const settingIcon = document.createElement('img');
                settingIcon.className = "setting-icon";
                layerItem.appendChild(settingIcon);
                settingIcon.onclick = this.settingLayerHandler(layer);


                layerItem.appendChild(input);
                layerItem.appendChild(label);

                thematicLayers.appendChild(layerItem);
            }
            input.onchange = this.handleLayerChange(index);
        })
    }

}

export default LayerSwitcher;