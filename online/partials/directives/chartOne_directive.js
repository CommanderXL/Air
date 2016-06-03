/**
 * Created by XRene on 2015/10/31.
 */

define(['pikaday', 'common/common_directive'], function (pikaday) {
    var chartModule = angular.module('chartModule', ['commonService']);

    chartModule.directive('chartData', function ($stateParams, $state, $_yaq) {
        return {
            restrict: 'EA',
            link: function (scope, ele, attr) {

                var theme_config_zone = {
                    chart: {
                        type: 'column'
                    },
                    title: {
                        text: '用电量(KW·h)',
                        style: {
                            fontWeight: 'bold',
                            fontFamily: 'Microsoft YaHei'
                        },
                        x: -20  //center
                    },
                    xAxis: {
                        type: 'category',
                        labels: {
                            fontFamily: 'Verdana, sans-serif'
                        }
                    },
                    yAxis: {
                        title: {
                            text: ''
                        },
                        plotLines: [{
                            value: 0,
                            width: 1,
                            color: '#808080'
                        }]
                    },
                    tooltip: {
                        valueSuffix: 'KW·h'
                    },
                    legend: {
                        layout: 'vertical',
                        align: 'right',
                        verticalAlign: 'middle',
                        borderWidth: 0
                    },
                    credits: {
                        enabled: false
                    },
                    series: [{
                        name: '用电量',
                        data: [],
                        dataLabels: {
                            enabled: true,
                            rotation: 0,
                            color: '#FFFFFF',
                            align: 'right',
                            format: '{point.y:.2f}', // one decimal
                            x: 10,
                            y: 4, // 10 pixels down from the top
                            style: {
                                fontSize: '13px',
                                fontFamily: 'Verdana, sans-serif'
                            }
                        }
                    }]
                };


                var theme_config_spline = {
                    chart: {
                        type: 'spline'
                    },
                    title: {
                        text: '用电量趋势图(KW·h)'
                    },
                    xAxis: {
                        type: 'datetime',
                        dateTimeLabelFormats: { // don't display the dummy year
                            month: '%e. %b',
                            year: '%b'
                        },
                        title: {
                            text: 'Date'
                        }
                    },
                    yAxis: {
                        min: 0
                    },
                    tooltip: {
                        headerFormat: '<b>{series.name}</b><br>',
                        pointFormat: $_yaq.timeToInit($_yaq.initToTime( + '{point.x }')) + '{point.x:%e. %b}: {point.y:.2f} KW·h'
                    },

                    plotOptions: {
                        spline: {
                            marker: {
                                enabled: true
                            }
                        }
                    },

                    series: []
                };


                scope.$watch('results', function (results) {


                    var _series = [];
                    //依据Highcharts数据配置方式处理数据
                    _.map(results, function (val, key) {
                        if(scope.selectedChart === 'zone') {
                            var num = Number(val.time * val.powerw / 1000).toFixed(2); //2位小数的处理.没用使用highchart自带的处理方式
                            _series.push([key, Number(num)]);
                        } else {
                            var _obj = {
                                name: key,
                                data: []
                            };
                            _.map(val, function(_val, _key) {
                                var num = Number(_val.time * _val.powerw / 1000).toFixed(2),
                                    _timeArr = _key.split('-');
                                _obj.data.push([Date.UTC(Number(_timeArr[0]), Number(_timeArr[1] - 1), Number(_timeArr[2])), Number(num)]);
                            });
                            _series.push(_obj);
                        }
                    });

                    //选择总量图或趋势图的渲染
                    if(scope.selectedChart === 'zone') {
                        theme_config_zone.series[0].data = _series;
                        //console.log(_categories);
                        $(ele).highcharts(theme_config_zone);
                    } else {
                        theme_config_spline.series = _series;
                        $(ele).highcharts(theme_config_spline);
                    }
                });
            }
        }
    });
});
