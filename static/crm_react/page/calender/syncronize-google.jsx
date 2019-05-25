import React from 'react';
import  {
    BASE_FULL_URL,
    language
} from 'crm_react/common/state';

class SyncronizeGoogle extends React.Component{
    constructor(props) {
      super(props);
      this.state = { syncronized:false}
      setInterval( () => {
            this.serverRequest = $.get('/google/google_sync/', function (data) {
              this.setState({syncronized: data.syncronized });
            }.bind(this));
       },10000)
    }

    render(){
      let syncronized = this.state.syncronized;
      return (
          syncronized?
              <div>
                <a href="/google/connect/">
                    <button className="btn btn-primary btn-discard btn-transparent">
                        Synchronize with google
                    </button>
                </a>
              </div>
          :null
      );
   }
}

module.exports = SyncronizeGoogle;