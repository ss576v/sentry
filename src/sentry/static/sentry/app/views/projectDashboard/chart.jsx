import React from "react";
import moment from "moment";
import api from "../../api";
import BarChart from "../../components/barChart";
import LoadingError from "../../components/loadingError";
import LoadingIndicator from "../../components/loadingIndicator";
import RouteMixin from "../../mixins/routeMixin";
import ProjectState from "../../mixins/projectState";

var ProjectChart = React.createClass({
  mixins: [
    RouteMixin,
    ProjectState,
  ],

  contextTypes: {
    router: React.PropTypes.func
  },

  getInitialState() {
    return {
      loading: true,
      error: false,
      stats: [],
      dateSince: (new Date().getTime() / 1000) - (3600 * 24 * 7)
    };
  },

  getStatsEndpoint() {
    var org = this.getOrganization();
    var project = this.getProject();
    if (org && project) {
      return "/projects/" + org.slug + "/" + project.slug + "/stats/?resolution=1h";
    }
  },

  componentWillMount() {
    this.fetchData();
  },

  routeDidChange(nextPath, nextParams) {
    var router = this.context.router;
    var params = router.getCurrentParams();
    if (params.orgId != nextParams.orgId || nextParams.projectId != params.projectId) {
      this.fetchData();
    }
  },

  fetchData() {
    var endpoint = this.getStatsEndpoint();
    if (!endpoint) {
      return;
    }

    this.setState({
      error: false,
      loading: true
    });

    api.request(endpoint, {
      query: {
        since: this.state.dateSince
      },
      success: (data) => {
        this.setState({
          stats: data,
          loading: false,
          error: false
        });
      },
      error: () => {
        this.setState({
          loading: false,
          error: true
        });
      }
    });
  },

  render() {
    var points = this.state.stats.map((point) => {
      return {x: point[0], y: point[1]};
    });

    return (
      <div className="box project-chart">
        <div className="box-content with-padding">
          <div className="bar-chart">
            {this.state.loading ?
              <LoadingIndicator />
            : (this.state.error ?
              <LoadingError onRetry={this.fetchData} />
            :
              <div className="chart-wrapper">
                <BarChart points={points} className="sparkline" />
                <small className="date-legend">{moment(this.state.dateSince * 1000).format("LL")}</small>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
});

export default ProjectChart;
