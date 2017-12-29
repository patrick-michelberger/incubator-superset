import React from 'react';
import ReactDOM from 'react-dom';
import {ScreenGridLayer} from 'deck.gl';
import {Modal} from 'react-bootstrap';

import DeckGLContainer from '../deckgl/DeckGLContainer';

class PredictionScreenGrid extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: true,
      info: {
        object: null,
        index: null
      }
    };

    this.toggleModal = this.toggleModal.bind(this);
    this.onEnterModal = this.onEnterModal.bind(this);
  }

  toggleModal(info) {
    console.log("toggleModal: info: ", info);
    this.setState({showModal: !this.state.showModal, info: info});
  }

  onEnterModal() {
    console.log("on enter modal");
  };

  render() {
    const {slice, payload, setControlValue} = this.props;
    const {info} = this.state;

    const fd = slice.formData;
    const c = fd.color_picker;
    const data = payload.data.features.map(d => ({
      ...d,
      color: [c.r, c.g, c.b, 255 * c.a],
    }));

    const viewport = {
      ...fd.viewport,
      width: slice.width(),
      height: slice.height(),
    };

    // Passing a layer creator function instead of a layer since the
    // layer needs to be regenerated at each render
    const layer = () => new ScreenGridLayer({
      id: `screengrid-layer-${slice.containerId}`,
      data,
      pickable: true,
      cellSizePixels: fd.grid_size,
      minColor: [c.r, c.g, c.b, 0],
      maxColor: [c.r, c.g, c.b, 255 * c.a],
      outline: false,
      getWeight: d => d.weight || 0,
      onClick: info => this.toggleModal(info)
    });

    return (
        <div>
          <DeckGLContainer
              mapboxApiAccessToken={payload.data.mapboxApiKey}
              viewport={viewport}
              layers={[layer]}
              mapStyle={fd.mapbox_style}
              setControlValue={setControlValue}
          />
          {info.object && info.object.position ? <Modal
                  show={this.state.showModal}
                  onHide={this.toggleModal}
                  onEnter={this.onEnterModal}
                  bsSize="lg"
              >
                <Modal.Header closeButton>
                  <Modal.Title>Demand Prediction for
                    Lat: {info.object.position[0]} |
                    Lon: {info.object.position[1]}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <div>Weight: {info.object.weight}</div>
                </Modal.Body>
              </Modal>
              : null}
        </div>
    )
  }
}

function PredictionScreenGridLayer(slice, payload, setControlValue) {

  ReactDOM.render(
      <PredictionScreenGrid slice={slice}
                            payload={payload}
                            setControlValue={setControlValue}/>,
      document.getElementById(slice.containerId),
  );
}

module.exports = PredictionScreenGridLayer;
