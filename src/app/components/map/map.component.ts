import { Component, OnInit } from '@angular/core';
import { HoldingService } from '../../services/holding.service';
import { DataMarker } from '../../dataMarker';
import * as moment from 'moment';

declare let L;
// import * as L from 'leaflet';

const redIcon =
  'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png';
const blueIcon =
  'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png';
const greenIcon =
  'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png';
const markerShadow =
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png';

const defaultMarker = new L.Icon({
  iconUrl: blueIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const defaultMarker2x = new L.Icon({
  iconUrl: blueIcon,
  shadowUrl: markerShadow,
  iconSize: [29, 45],
  iconAnchor: [19, 45],
  popupAnchor: [-5, -32],
  shadowSize: [45, 45]
});

const defaultMarker3x = new L.Icon({
  iconUrl: blueIcon,
  shadowUrl: markerShadow,
  iconSize: [31, 48],
  iconAnchor: [19, 48],
  popupAnchor: [-3, -32],
  shadowSize: [48, 48]
});

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {
  constructor(
    private holdingService: HoldingService
  ) {}

  ngOnInit() {
    const map = L.map('map').setView([23.777176, 90.399452], 13);
    const info = L.control();
    let legend = L.control({ position: 'bottomright' });
    let markerIcon;

    this.holdingService.getHoldings().subscribe((data: any) => {
      addToMap(data);
    });

    function getColor(d) {
      return d === 'default'
        ? '#4169e1'
        : d === 'ok'
        ? '#32cd32'
        : d === 'tax'
        ? '#b22222'
        : '#4169e1';
    }

    function addToMap(data) {
      L.tileLayer(
        'https://map.barikoi.com/styles/klokantech-basic/{z}/{x}/{y}.png',
        {
          maxZoom: 18,
          attribution: `<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | 
            <a href="https://openmaptiles.org/">OpenMapTiles</a> |
            <a href="https://Barikoi.com">Barikoi</a>`,
          id: 'mapbox.streets'
        }
      ).addTo(map);

      map.zoomControl.setPosition('topleft');

      data.forEach((holding: any) => {
        if (holding.holding_tax_amount <= 25000) {
          markerIcon = defaultMarker;
        } else if (holding.holding_tax_amount <= 50000) {
          markerIcon = defaultMarker2x;
        } else {
          markerIcon = defaultMarker3x;
        }

        if (holding.due_payment > 0) {
          markerIcon.options.iconUrl = redIcon;
        } else if (holding.due_payment === 0) {
          markerIcon.options.iconUrl = greenIcon;
        }

        const marker = new DataMarker(
          [holding.latitude, holding.longitude],
          holding,
          { icon: markerIcon }
        )
          .addTo(map)
          .bindPopup(`Tax Amount: ${holding.holding_tax_amount}`)
          .on('click', e => {
            info.update(e.sourceTarget.data);
          });
      });

      // info for markers
      info.onAdd = function() {
        this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
        this.update();
        return this._div;
      };

      function isISODate(data: any) {
        if (data != null) { return moment(data).format('LL'); } else { return 'Not Available'; }
      }

      function isNullData(data: any) {
        if (!data) { return 'Not Available'; }
        return data;
      }

      info.update = function(holding) {
        this._div.innerHTML =
          '<h4>Barikoi Holding Data</h4>' +
          (holding
            ? '<b>' +
              'Owner: ' +
              isNullData(holding.owners_name) +
              '</b><br />' +
              'Holding Number: ' +
              isNullData(holding.e_holding_number) +
              '<br/>' +
              'Address: ' +
              isNullData(holding.address) +
              '<br/>' +
              'Due Tax: ' +
              isNullData(holding.due_payment) +
              '<br/>' +
              'Tax Amount: ' +
              isNullData(holding.holding_tax_amount) +
              '<br/>' +
              'Assessor\'s Name: ' +
              isNullData(holding.assessor_name) +
              '<br/>' +
              'Assessment Date: ' +
              isISODate(holding.assessment_date) +
              '<br/>' +
              'Reg. Date: ' +
              isISODate(holding.holding_reg_date) +
              '<br/>'
            : 'Click on marker');

        setTimeout(() => {
          this._div.innerHTML =
            '<h4>Barikoi Holding Data</h4>' + 'Click on marker';
        }, 180000);
      };

      info.addTo(map);

      // Map Legend
      legend = L.control({ position: 'bottomright' });

      legend.onAdd = () => {
        const div = L.DomUtil.create('div', 'info legend');
        const grades = ['default', 'ok', 'tax'];
        const labels = ['Default', 'No Issues', 'Tax Due'];

        // loop through our density intervals and generate a label with a colored square for each interval
        for (let i = 0; i < grades.length; i++) {
          div.innerHTML +=
            '<i style="background:' +
            getColor(grades[i]) +
            '" ></i> ' +
            labels[i] +
            '<br>';
        }

        return div;
      };

      legend.addTo(map);
    }
  }
}
