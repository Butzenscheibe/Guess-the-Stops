//specify training-regions for training mode with queries
/*
Each region must have a "country" key with the country code as value.
A region is a geographical region, f.e. a City or Metropolitan Area. 
A region can also be a specific line or group of lines (f.e. SBB IC1).
A region has its own set of sql queries for route selection.
Structure:
{
    country: "de", //country code
    regions: [
        {
            name: "Berlin", //name of the region
            selectableModes: [
                {mode: U-Bahn-Total, query: "SELECT ..."},
                {mode: S-Bahn-Total, query: "SELECT ..."},
                {mode: S10, query: "SELECT ..."}
            ]
        }
}
RegionPath is country_regionname_mode
f.e. ch_Zurich_S11A
 */
const trainingRegions = [
  {
    country: "ch",
    regions: [
      {
        name: "Zurich",
        selectableModes: [
          // Total mode for S-Bahn lines
          {
            mode: "S-Bahn-Total",
            query: `SELECT trip_id, route_id FROM trips WHERE trip_id IN (
  '247.TA.91-29-A-j26-1.7.H',
  '451.TA.91-12-j26-1.131.H',
  '11.TA.91-42-j26-1.14.H',
  '2.TA.91-21-E-j26-1.1.H',
  '183.TA.91-9-D-j26-1.103.H',
  '110.TA.91-14-C-j26-1.42.H',
  '27.TA.91-36-j26-1.7.H',
  '196.TA.91-13-A-j26-1.12.H',
  '191.TA.91-8-C-j26-1.80.H',
  '154.TA.91-26-A-j26-1.12.H',
  '1.TA.91-20-D-j26-1.3.H',
  '65.TA.91-30-A-j26-1.17.H',
  '511.TA.91-6-D-j26-1.7.H',
  '2.TA.91-41-j26-1.1.H',
  '359.TA.91-5-C-j26-1.9.H',
  '438.TA.91-11-A-j26-1.115.H',
  '76.TA.91-19-A-j26-1.8.H',
  '227.TA.91-25-j26-1.13.H',
  '9.TA.91-23-B-j26-1.3.H',
  '170.TA.91-35-j26-1.29.H',
  '249.TA.91-2-B-j26-1.45.H',
  '46.TA.91-3-D-j26-1.4.H',
  '485.TA.91-12-j26-1.75.H',
  '129.TA.91-4-A-j26-1.19.H',
  '123.TA.91-40-j26-1.10.H',
  '331.TA.91-11-A-j26-1.45.H',
  '476.TA.91-7-C-j26-1.7.H',
  '83.TA.91-33-j26-1.9.H',
  '290.TA.91-16-A-j26-1.56.H',
  '260.TA.91-15-C-j26-1.5.H',
  '175.TA.91-10-A-j26-1.9.H',
  '373.TA.91-17-A-j26-1.5.H',
  '777.TA.91-24-j26-1.57.H'
) order by random() limit 1;`
          },
          // Individual lines
          {
            mode: "S29",
            query: `SELECT trip_id, route_id FROM trips WHERE trip_id = '247.TA.91-29-A-j26-1.7.H'`
          },
          {
            mode: "S12A",
            query: `SELECT trip_id, route_id FROM trips WHERE trip_id = '451.TA.91-12-j26-1.131.H'`
          },
          {
            mode: "S42",
            query: `SELECT trip_id, route_id FROM trips WHERE trip_id = '11.TA.91-42-j26-1.14.H'`
          },
          {
            mode: "S21",
            query: `SELECT trip_id, route_id FROM trips WHERE trip_id = '2.TA.91-21-E-j26-1.1.H'`
          },
          {
            mode: "S9",
            query: `SELECT trip_id, route_id FROM trips WHERE trip_id = '183.TA.91-9-D-j26-1.103.H'`
          },
          {
            mode: "S14",
            query: `SELECT trip_id, route_id FROM trips WHERE trip_id = '110.TA.91-14-C-j26-1.42.H'`
          },
          {
            mode: "S36",
            query: `SELECT trip_id, route_id FROM trips WHERE trip_id = '27.TA.91-36-j26-1.7.H'`
          },
          {
            mode: "S13",
            query: `SELECT trip_id, route_id FROM trips WHERE trip_id = '196.TA.91-13-A-j26-1.12.H'`
          },
          {
            mode: "S8",
            query: `SELECT trip_id, route_id FROM trips WHERE trip_id = '191.TA.91-8-C-j26-1.80.H'`
          },
          {
            mode: "S26",
            query: `SELECT trip_id, route_id FROM trips WHERE trip_id = '154.TA.91-26-A-j26-1.12.H'`
          },
          {
            mode: "S20",
            query: `SELECT trip_id, route_id FROM trips WHERE trip_id = '1.TA.91-20-D-j26-1.3.H'`
          },
          {
            mode: "S30",
            query: `SELECT trip_id, route_id FROM trips WHERE trip_id = '65.TA.91-30-A-j26-1.17.H'`
          },
          {
            mode: "S6",
            query: `SELECT trip_id, route_id FROM trips WHERE trip_id = '511.TA.91-6-D-j26-1.7.H'`
          },
          {
            mode: "S41",
            query: `SELECT trip_id, route_id FROM trips WHERE trip_id = '2.TA.91-41-j26-1.1.H'`
          },
          {
            mode: "S5",
            query: `SELECT trip_id, route_id FROM trips WHERE trip_id = '359.TA.91-5-C-j26-1.9.H'`
          },
          {
            mode: "S11B",
            query: `SELECT trip_id, route_id FROM trips WHERE trip_id = '438.TA.91-11-A-j26-1.115.H'`
          },
          {
            mode: "S19",
            query: `SELECT trip_id, route_id FROM trips WHERE trip_id = '76.TA.91-19-A-j26-1.8.H'`
          },
          {
            mode: "S25",
            query: `SELECT trip_id, route_id FROM trips WHERE trip_id = '227.TA.91-25-j26-1.13.H'`
          },
          {
            mode: "S23",
            query: `SELECT trip_id, route_id FROM trips WHERE trip_id = '9.TA.91-23-B-j26-1.3.H'`
          },
          {
            mode: "S35",
            query: `SELECT trip_id, route_id FROM trips WHERE trip_id = '170.TA.91-35-j26-1.29.H'`
          },
          {
            mode: "S2",
            query: `SELECT trip_id, route_id FROM trips WHERE trip_id = '249.TA.91-2-B-j26-1.45.H'`
          },
          {
            mode: "S3",
            query: `SELECT trip_id, route_id FROM trips WHERE trip_id = '46.TA.91-3-D-j26-1.4.H'`
          },
          {
            mode: "S12B",
            query: `SELECT trip_id, route_id FROM trips WHERE trip_id = '485.TA.91-12-j26-1.75.H'`
          },
          {
            mode: "S4",
            query: `SELECT trip_id, route_id FROM trips WHERE trip_id = '129.TA.91-4-A-j26-1.19.H'`
          },
          {
            mode: "S40",
            query: `SELECT trip_id, route_id FROM trips WHERE trip_id = '123.TA.91-40-j26-1.10.H'`
          },
          {
            mode: "S11A",
            query: `SELECT trip_id, route_id FROM trips WHERE trip_id = '331.TA.91-11-A-j26-1.45.H'`
          },
          {
            mode: "S7",
            query: `SELECT trip_id, route_id FROM trips WHERE trip_id = '476.TA.91-7-C-j26-1.7.H'`
          },
          {
            mode: "S33",
            query: `SELECT trip_id, route_id FROM trips WHERE trip_id = '83.TA.91-33-j26-1.9.H'`
          },
          {
            mode: "S16",
            query: `SELECT trip_id, route_id FROM trips WHERE trip_id = '290.TA.91-16-A-j26-1.56.H'`
          },
          {
            mode: "S15",
            query: `SELECT trip_id, route_id FROM trips WHERE trip_id = '260.TA.91-15-C-j26-1.5.H'`
          },
          {
            mode: "S10",
            query: `SELECT trip_id, route_id FROM trips WHERE trip_id = '175.TA.91-10-A-j26-1.9.H'`
          },
          {
            mode: "S17",
            query: `SELECT trip_id, route_id FROM trips WHERE trip_id = '373.TA.91-17-A-j26-1.5.H'`
          },
          {
            mode: "S24",
            query: `SELECT trip_id, route_id FROM trips WHERE trip_id = '777.TA.91-24-j26-1.57.H'`
          }
        ]
      }
    ]
  },
  {
    country: "nsw",
    regions: [
      {
        name: "Sydney Trains",
        selectableModes: [
          {
            mode: "Sydney-Trains-Total",
            query: `SELECT trip_id, route_id FROM trips WHERE trip_id IN (
              '172F.487.143.48.A.8.88357991',
              '52AF.974.155.4.M.4.88566216',
              '158J.1989.100.16.A.8.89040683',
              '71BR.1346.154.128.M.4.88362462',
              '609M.487.143.4.T.8.88359675',
              '86-H.1346.154.128.A.8.88363531',
              '143R.487.143.32.A.8.88357843',
              '162M.1978.102.16.A.8.87903843',
              '137P.974.155.16.A.8.88566437',
              '60-C.487.143.32.M.8.88358071',
              '18-D.487.143.4.B.8.88360597',
              '92-B.487.143.32.A.8.88359247',
              '14-P.1346.154.2.B.8.88364731',
              '64-E.974.155.60.M.8.88565190',
              '611G.974.155.64.T.8.88590700'
            ) order by random() limit 1;`
          },

          {
            mode: "T1 City-Richmond",
            query: `SELECT trip_id, route_id FROM trips WHERE trip_id = '172F.487.143.48.A.8.88357991'`
          },
          {
            mode: "T5 Leppington-Schofields",
            query: `SELECT trip_id, route_id FROM trips WHERE trip_id = '52AF.974.155.4.M.4.88566216'`
          },
          {
            mode: "T1 City-Penrith",
            query: `SELECT trip_id, route_id FROM trips WHERE trip_id = '158J.1989.100.16.A.8.89040683'`
          },
          {
            mode: "T6 Lidcombe-Bankstown",
            query: `SELECT trip_id, route_id FROM trips WHERE trip_id = '71BR.1346.154.128.M.4.88362462'`
          },
          {
            mode: "T4 Bondi Junction-Cronulla",
            query: `SELECT trip_id, route_id FROM trips WHERE trip_id = '609M.487.143.4.T.8.88359675'`
          },
          {
            mode: "T8 City-Revesby",
            query: `SELECT trip_id, route_id FROM trips WHERE trip_id = '86-H.1346.154.128.A.8.88363531'`
          },
          {
            mode: "T1/9 City-Berowra",
            query: `SELECT trip_id, route_id FROM trips WHERE trip_id = '143R.487.143.32.A.8.88357843'`
          },
          {
            mode: "T1 City-Emu Plains",
            query: `SELECT trip_id, route_id FROM trips WHERE trip_id = '162M.1978.102.16.A.8.87903843'`
          },
          {
            mode: "T9 City-Hornsby",
            query: `SELECT trip_id, route_id FROM trips WHERE trip_id = '137P.974.155.16.A.8.88566437'`
          },
          {
            mode: "T8 City-Sydenham",
            query: `SELECT trip_id, route_id FROM trips WHERE trip_id = '60-C.487.143.32.M.8.88358071'`
          },
          {
            mode: "T3 City-Liverpool",
            query: `SELECT trip_id, route_id FROM trips WHERE trip_id = '18-D.487.143.4.B.8.88360597'`
          },
          {
            mode: "T2 City-Parramatta",
            query: `SELECT trip_id, route_id FROM trips WHERE trip_id = '92-B.487.143.32.A.8.88359247'`
          },
          {
            mode: "T8 City-Macarthur",
            query: `SELECT trip_id, route_id FROM trips WHERE trip_id = '14-P.1346.154.2.B.8.88364731'`
          },
          {
            mode: "T2 City-Leppington",
            query: `SELECT trip_id, route_id FROM trips WHERE trip_id = '64-E.974.155.60.M.8.88565190'`
          },
          {
            mode: "T4 Bondi Junction-Waterfall",
            query: `SELECT trip_id, route_id FROM trips WHERE trip_id = '611G.974.155.64.T.8.88590700'`
          }
        ]
      }
    ]
  }
];
module.exports = { trainingRegions };
