//Bangladesh
var dataURL = "http://data.humdata.org/dataset/e31467b1-0f37-40ea-b5be-558cf8c1b8aa/resource/4585dc95-9547-402d-aafa-145ee8d92034/download/fts_funding_bgd.csv";
//Yemen
//var dataURL = "https://data.humdata.org/dataset/6a60da4e-253f-474f-8683-7c9ed9a20bf9/resource/892affae-9a91-4f27-8640-4630412e663f/download/fts_funding_afg.csv"

var proxyURL = "https://proxy.hxlstandard.org/data.json?strip-headers=on&url="+encodeURIComponent(dataURL);

//backup data
//var proxyURL = "backup-data/data.json"

function initVisual(data){
    $('.dash').show();
    var funder_chart = dc.rowChart("#funder");
    var type_chart = dc.rowChart("#type");
    var amount_chart = dc.pieChart("#amount");

    var cf = crossfilter(data);

    cf.funder = cf.dimension(function(d){ return d['#org+name']; });
    cf.type = cf.dimension(function(d){ return d['#org+type']; });
    cf.amount = cf.dimension(function(d){ return d['#status+text']; });

    var funder = cf.funder.group().reduceSum(function(d) {return d['#value+funding+total+usd'];});
    var type = cf.type.group().reduceSum(function(d) {return d['#value+funding+total+usd'];});
    var amount = cf.amount.group().reduceSum(function(d) {return d['#value+funding+total+usd'];});
    var fundingall = cf.groupAll().reduceSum(function(d) {return d['#value+funding+total+usd'];});
    var all = cf.groupAll();

    funder_chart.width($('#funder').width()-50).height(550)
            .margins({top: 0, left: 10, right: 40, bottom: 40})
            .dimension(cf.funder)
            .group(funder)
            .elasticX(true)
            .data(function(group) {
                return group.top(20);
            })
            .colors(['#2196F3'])
            .colorAccessor(function(d, i){return 0;})
            .title(function(d){
                return formatTitle(d.key,d.value);
                })
            .xAxis().ticks(3);

    type_chart.width($('#type').width()-50).height(250)
            .margins({top: 0, left: 10, right: 40, bottom: 40})
            .dimension(cf.type)
            .group(type)
            .elasticX(true)
            .data(function(group) {
                return group.top(20);
            })
            .colors(['#2196F3'])
            .colorAccessor(function(d, i){return 0;})
            .title(function(d){
                return formatTitle(d.key,d.value);
                })
            .xAxis().ticks(3);

    amount_chart.width($('#amount').width()).height(200)
            .dimension(cf.amount)
            .group(amount)
            .colors(['#4CAF50','#9CCC65','#FFD600'])
            .colorDomain([0,2])
            .colorAccessor(function(d, i){
                i=2;
                if(d.key=='paid'){
                    i = 0
                } else if(d.key=='commitment'){
                    i = 1;
                }
                return i;
            })
            .title(function(d){
                return formatTitle(d.key,d.value);
                });

    dc.dataCount("#fundingtotal")
    	.dimension(cf)
    	.group(fundingall);

    dc.dataCount("#count-info")
    	.dimension(cf)
    	.group(all);
            
    $('.sp-circle').remove();

    dc.renderAll();

    var g = d3.selectAll("#organisation").select("svg").append("g");
        
        g.append("text")
            .attr("class", "x-axis-label")
            .attr("text-anchor", "middle")
            .attr("x", 160)
            .attr("y", 542)
            .text("US Dollars");

    var g = d3.selectAll("#funder").select("svg").append("g");
        
        g.append("text")
            .attr("class", "x-axis-label")
            .attr("text-anchor", "middle")
            .attr("x", 160)
            .attr("y", 542)
            .text("US Dollars");
}

function formatTitle(key, value){
    var v;
    if(value>1000000){
        value=value/1000000;
        v=value.toFixed(2)+" million";
    } else {
        v=value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    return key+": $"+v;
}

function hxlProxyToJSON(input){
    var output = [];
    var keys=[]
    input.forEach(function(e,i){
        if(i==0){
            e.forEach(function(e2,i2){
                var parts = e2.split('+');
                var key = parts[0]
                if(parts.length>1){
                    var atts = parts.splice(1,parts.length);
                    atts.sort();                    
                    atts.forEach(function(att){
                        key +='+'+att
                    });
                }
                keys.push(key);
            });
        } else {
            var row = {};
            e.forEach(function(e2,i2){
                row[keys[i2]] = e2;
            });
            output.push(row);
        }
    });
    return output;
}

$('.dash').hide();

var dataCall = $.ajax({ 
    type: 'GET', 
    url: proxyURL,
    dataType: 'json',
});

$.when(dataCall).then(function(dataArgs){
    var data = hxlProxyToJSON(dataArgs);
    initVisual(data);
});