import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {ScreenGridLayer, GeoJsonLayer} from 'deck.gl';
import {Modal} from 'react-bootstrap';

import DeckGLContainer from '../deckgl/DeckGLContainer';

// Controls
import SelectControl from '../../javascripts/explore/components/controls/SelectControl';
import TextControl from '../../javascripts/explore/components/controls/TextControl';

// Data
import Neighborhoods from './neighborhoods.json';
import Dayofweeks from './dayofweek.json';
const data_geojson = require('./seattle_neighborhoods.geojson.json');

// Initial Dummy Chart
import {
    XAxis,
    YAxis,
    HorizontalGridLines,
    FlexibleWidthXYPlot,
    LineSeries,
    DiscreteColorLegend
} from 'react-vis';
import '../../node_modules/react-vis/dist/style.css';

import Highlight from './highlight';
const totalValues = 100;

/**
 * Get the array of x and y pairs.
 * The function tries to avoid too large changes of the chart.
 * @param {number} total Total number of values.
 * @returns {Array} Array of data.
 * @private
 */
function getRandomSeriesData(total) {
    const result = [];
    let lastY = Math.random() * 40 - 20;
    let y;
    const firstY = lastY;
    for (let i = 0; i < total; i++) {
        y = Math.random() * firstY - firstY / 2 + lastY;
        result.push({
            x: i,
            y
        });
        lastY = y;
    }
    return result;
}

class PredictionScreenGrid extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showModal: true,
            info: {
                object: null,
                index: null
            },
            lastDrawLocation: null,
            series: [
                {
                    title: 'Apples',
                    disabled: false,
                    data: getRandomSeriesData(totalValues)
                },
                {
                    title: 'Bananas',
                    disabled: false,
                    data: getRandomSeriesData(totalValues)
                }
            ],
            neigborhoodValue: 0,
            dayofweekValue: 'mon',
            numberofdriversValue: 4
        };

        this.toggleModal = this.toggleModal.bind(this);
        this.onEnterModal = this.onEnterModal.bind(this);
        this.setNeighborhood = this.setNeighborhood.bind(this);
        this.setDayofweek = this.setDayofweek.bind(this);
        this.setNumberofdrivers = this.setNumberofdrivers.bind(this);
    }

    toggleModal(info) {
        this.setState({showModal: !this.state.showModal, info: info});
    }

    onEnterModal() {
        console.log("on enter modal");
    };

    setNeighborhood(neigborhoodValue) {
        this.setState({neigborhoodValue});
    };

    setDayofweek(dayofweekValue) {
        this.setState({dayofweekValue});
    };

    setNumberofdrivers(numberofdriversValue) {
        this.setState({numberofdriversValue});
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

        /*
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
         */
        const colorScale = r => [r * 255, 140 * r, 200 * (1 - r)];

        const layer = () => new GeoJsonLayer({
            id: `screengrid-layer-${slice.containerId}`,
            data: data_geojson,
            opacity: 0.5,
            stroked: true,
            filled: true,
            extruded: false,
            wireframe: false,
            getFillColor: f => {
                return colorScale(Math.random());
            },
            getLineColor: f => [0, 0, 0],
            pickable: true,
            getPickingInfo: info => this.toggleModal(info)
        });

        const {series, lastDrawLocation} = this.state;

        const series_test = [
            {
                title: 'Apples',
                disabled: false,
                data: getRandomSeriesData(totalValues)
            },
            {
                title: 'Bananas',
                disabled: false,
                data: getRandomSeriesData(totalValues)
            }
        ];

        return (
            <div>
                <DeckGLContainer
                    mapboxApiAccessToken={payload.data.mapboxApiKey}
                    viewport={viewport}
                    layers={[layer]}
                    mapStyle={fd.mapbox_style}
                    setControlValue={setControlValue}
                />
                <Modal
                    show={this.state.showModal}
                    onHide={this.toggleModal}
                    onEnter={this.onEnterModal}
                    bsSize="lg"
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Demand Prediction</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="example-with-click-me">
                            <div className="legend">
                                <DiscreteColorLegend
                                    width={180}
                                    items={series}/>
                            </div>

                            <div style={{"height": "350px"}}>
                                <FlexibleWidthXYPlot animate height={300}>

                                    <HorizontalGridLines />

                                    <YAxis />
                                    <XAxis />

                                    {series_test.map(entry => (
                                        <LineSeries
                                            key={entry.title}
                                            data={entry.data}
                                        />
                                    ))}


                                    <Highlight onBrushEnd={(area) => {
                                        this.setState({
                                            lastDrawLocation: area
                                        });
                                    }}/>

                                </FlexibleWidthXYPlot>
                            </div>


                            <button className="showcase-button" onClick={() => {
                                this.setState({lastDrawLocation: null});
                            }}>
                                Reset Zoom
                            </button>

                            <div>
                                <h4>
                                    <b>Last Draw Area</b>
                                </h4>
                                {lastDrawLocation ? (
                                    <ul style={{listStyle: 'none'}}>
                                        <li><b>Top:</b> {lastDrawLocation.top}</li>
                                        <li><b>Right:</b> {lastDrawLocation.right}</li>
                                        <li><b>Bottom:</b> {lastDrawLocation.bottom}</li>
                                        <li><b>Left:</b> {lastDrawLocation.left}</li>
                                    </ul>
                                ) : <span>N/A</span>}
                            </div>


                            <hr/>
                            <h4>
                                <b>Set Neighborhood</b>
                            </h4>


                            <SelectControl
                                name="neighborhood"
                                options={Neighborhoods}
                                onChange={this.setNeighborhood}
                                value={this.state.neigborhoodValue}
                            />

                            <hr/>

                            <h4>
                                <b>Set Day of Week</b>
                            </h4>

                            <SelectControl
                                name="dayofweek"
                                options={Dayofweeks}
                                onChange={this.setDayofweek}
                                value={this.state.dayofweekValue}
                            />

                            <hr/>

                            <h4>
                                <b>Set Number of Drivers</b>
                            </h4>

                            <TextControl
                                value={this.state.numberofdriversValue}
                                onChange={this.setNumberofdrivers}
                                isFloat
                            />
                        </div>
                    </Modal.Body>
                </Modal>
            </div>
        )


    }
}

function PredictionScreenGridLayer(slice, payload, setControlValue) {


    console.log("slice: ", slice.width());

    ReactDOM.render(
        <PredictionScreenGrid slice={slice}
                              payload={payload}
                              setControlValue={setControlValue}/>,
        document.getElementById(slice.containerId),
    );
}

module.exports = PredictionScreenGridLayer;
