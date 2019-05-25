import React from 'react';

class  TimeZones extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            time_zones:['Africa/Abidjan','Africa/Accra','Africa/Accra','Africa/Addis_Ababa','Asia/Kolkata','Europe/Paris'],
        }

    }

    render() {
        let time_zones = this.state.time_zones;
        console.log(time_zones)
        return (
            <div className="form-group">
                <select className="form-control fa fa-angle-down black">
                    {
                        time_zones.map((name, j) => {
                           return <option value={name}>{name}</option>
                        })
                    }
                </select>
            </div>
        );
     }
}
module.exports = TimeZones;

