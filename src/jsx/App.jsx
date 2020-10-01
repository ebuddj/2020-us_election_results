import React, {Component} from 'react';
import style from './../styles/styles.less';

// https://d3js.org/
import * as d3 from 'd3';

// https://www.chartjs.org/
import Chart from 'chart.js';

let path_prefix, chart, interval;
if (location.href.match('localhost')) {
  path_prefix = './';
}
else {
  path_prefix = 'https://raw.githubusercontent.com/ebuddj/2020-us_election_results/master/public/';
}

class App extends Component {
  constructor(props) {
    super(props);

    this.appRef = React.createRef();
    this.chartRef = React.createRef();

    this.state = {
      backgrounds:[],
      current_data:{
        hurricanes:0
      },
      'img_src':'ElectoralCollege1992.svg'
    }
  }
  componentDidMount() {
    this.getData();
  }
  componentDidUpdate(prevProps, prevState, snapshot) {

  }
  componentWillUnMount() {
    clearInterval(interval);
  }
  // shouldComponentUpdate(nextProps, nextState) {}
  // static getDerivedStateFromProps(props, state) {}
  // getSnapshotBeforeUpdate(prevProps, prevState) {}
  // static getDerivedStateFromError(error) {}
  // componentDidCatch() {}
  getData() {
    d3.csv('./data/data - data.csv').then((data) => {
      let backgrounds = [];
      let bar_chart_data = {
        labels:[],
        datasets:[{
          backgroundColor:[],
          data:[],
          label:'D'
        },{
          backgroundColor:[],
          data:[],
          label:'Republican'
        }]
      };
      console.log(data)
      data.map((values, i) => {
        backgrounds.push(path_prefix + 'img/ElectoralCollege' + values.year + '.svg');
        bar_chart_data.labels.push(values.year);
        if (values.winner_party === 'D') {
          bar_chart_data.datasets[0].data.push(values.winner_electoral_votes);
          bar_chart_data.datasets[0].backgroundColor.push('rgba(105, 141, 197, 0.45)');

          bar_chart_data.datasets[1].data.push(values.runnerup_electoral_votes);
          bar_chart_data.datasets[1].backgroundColor.push('rgba(240, 119, 99, 0.45)');
        }
        else {
          bar_chart_data.datasets[0].data.push(values.runnerup_electoral_votes);
          bar_chart_data.datasets[0].backgroundColor.push('rgba(105, 141, 197, 0.45)');

          bar_chart_data.datasets[1].data.push(values.winner_electoral_votes);
          bar_chart_data.datasets[1].backgroundColor.push('rgba(240, 119, 99, 0.45)');
        }
      });
      console.log(bar_chart_data)
      this.setState((state, props) => ({
        backgrounds:backgrounds,
        data:{...data}
      }), this.createChart(bar_chart_data, data));
    });
  }
  createChart(bar_chart_data, data) {
    let ctx = this.chartRef.current.getContext('2d');

    chart = new Chart(ctx, {
      data:bar_chart_data,
      options:{
        hover:{
          enabled:false,
        },
        legend:{
          display:false
        },
        onClick:this.handleClick.bind(this),
        onHover:(event, chartElement) => {
          event.target.style.cursor = chartElement[0] ? 'pointer' : 'default';
        },
        scales:{
          xAxes: [{
            display:true,
            gridLines:{
              display:false
            },
            ticks: {
              autoSkip:false,
              fontColor:'#000',
              fontSize:16,
              fontStyle:'bold',
              maxRotation:0,
              minRotation:0
            },
            stacked:false
          }],
          yAxes: [{
            display:false,
            stacked:false,
            ticks: {
              suggestedMin: 0
            }
          }]
        },
        title:{
          display:false,
        },
        tooltips:{
          enabled:false
        }
      },
      type:'bar'
    });
    this.createInterval(data);
  }
  handleClick(evt) {
    clearInterval(interval);
    let active_element = chart.getElementAtEvent(evt)[0];
    if (active_element) {
      this.changeData(active_element._index, this.state.data[active_element._index])
    }
  }
  createInterval(data) {
    let i = 0;
    interval = setInterval(() => {
      this.appRef.current.style.display = 'block';
      if (data[0]) {
        let current_data = data.shift();
        this.changeData(i, current_data);
        i++;
      }
      else {
        clearInterval(interval);
      }
    }, 3500);
  }
  changeData(i, current_data) {
    this.setState((state, props) => ({
      current_data:current_data,
      img_src:'ElectoralCollege' + current_data.year + '.svg'
    }));
    chart.data.datasets[0].backgroundColor = chart.data.datasets[0].backgroundColor.map((background) => {
      return 'rgba(105, 141, 197, 0.45)';
    });
    chart.data.datasets[1].backgroundColor = chart.data.datasets[1].backgroundColor.map((background) => {
      return 'rgba(240, 119, 99, 0.45)';
    });
    chart.data.datasets[0].backgroundColor[i] = 'rgba(105, 141, 197, 1)';
    chart.data.datasets[1].backgroundColor[i] = 'rgba(240, 119, 99, 1)';
    chart.update(0);
  }
  // shouldComponentUpdate(nextProps, nextState) {}
  // static getDerivedStateFromProps(props, state) {}
  // getSnapshotBeforeUpdate(prevProps, prevState) {}
  // static getDerivedStateFromError(error) {}
  // componentDidCatch() {}
  render() {
    return (
      <div className={style.app} ref={this.appRef}>
        <div className={style.meta_container}>
          <div className={style.meta_wrapper}>
            <h3>{this.state.current_data.year} Election</h3>
            <div>
              <div className={style.label}>Winner</div>
              <div className={style.value_container}>
                <span className={style.value}>
                  <div className={style.nowrap}><span className={style.indicator} style={(this.state.current_data.winner_party === 'D') ? {backgroundColor: 'rgba(105, 141, 197, 1)'} : {backgroundColor: 'rgba(240, 119, 99, 1)'}}></span> {this.state.current_data.winner_name}, {this.state.current_data.winner_party}</div> 
                  <div className={style.votes}>{this.state.current_data.winner_electoral_votes} electoral votes</div>
                </span>
              </div>
            </div>
            <div>
              <div className={style.label}>Runner-up</div>
              <div className={style.value_container}>
                <span className={style.value}>
                  <div className={style.nowrap}><span className={style.indicator} style={(this.state.current_data.runnerup_party === 'D') ? {backgroundColor: 'rgba(105, 141, 197, 1)'} : {backgroundColor: 'rgba(240, 119, 99, 1)'}}></span> {this.state.current_data.runnerup_name}, {this.state.current_data.runnerup_party}</div> 
                  <div className={style.votes}>{this.state.current_data.runnerup_electoral_votes} electoral votes</div>
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className={style.chart_container}>
          <canvas id={style.chart} ref={this.chartRef}></canvas>
        </div>
        <div className={style.hidden}>
          {this.state.backgrounds && this.state.backgrounds.map((background, i) => {
            return (<img src={background} key={i}/>)
          })}
        </div>
        <div className={style.background_container} style={{backgroundImage:'url(' + path_prefix + 'img/' + this.state.img_src + ')'}}></div>
      </div>
    );
  }
}
export default App;