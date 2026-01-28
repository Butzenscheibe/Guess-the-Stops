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
);`
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
  }
];
module.exports = { trainingRegions };
