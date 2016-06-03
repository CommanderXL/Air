/**
 * Created by XRene on 16/5/15.
 */

define(function () {
    var commonDirective = angular.module('commonDirective', []);

    commonDirective.directive('baseDroplist', function ( ) {
        return {
            restrict: 'EA',
            link: function (scope, ele) {
                $(ele).on('click', function (e) {

                    var obj = $(this).find('.dropdown-menu');
                    if(obj.css('display') === 'block'){
                        obj.hide();
                        return;
                    }

                    $('.dropdown-menu').hide();
                    obj.show();

                    e.stopPropagation();
                }).on('click', 'input', function (e) {
                    e.stopPropagation();
                });

                $(window).on('click', function () {
                    $('.dropdown-menu').hide();
                })
            }
        }
    });

    commonDirective.directive('datepicker', function () {
        return {
            restrict: 'EA',
            require: 'ngModel',
            link: function (scope, element, attrs, ngModelCtrl) {
                var picker = new Pikaday( {
                    field: element[0],
                    firstDay: 0,
                    yearRange: [2000, 2020],
                    format: 'YYYY-MM-DD HH:mm',
                    hours24format : false,
                    i18n: {
                        previousMonth : '上月',
                        nextMonth     : '下月',
                        months        : ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'],
                        weekdays      : ['周日','周一','周二','周三','周四','周五','周六'],
                        weekdaysShort : ['日','一','二','三','四','五','六']
                    },
                    onSelect: function() {
                        ngModelCtrl.$setViewValue(this.getMoment());
                        ngModelCtrl.$render();
                        scope.$apply();
                    }
                });
            }
        }
    })
});