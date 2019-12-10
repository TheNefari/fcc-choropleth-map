const countySource ="https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";
const educationSource ="https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";

main();

async function getInfo(source) {
  const response = await fetch(source);
  const data = await response.json();
  return data;
}
async function main() {
  const countyJson = await getInfo(countySource);
  const educationJson = await getInfo(educationSource);

  const padding = 50;
  const w = window.innerWidth - padding;
  const h = 0.8 * window.innerHeight - padding;

  //const xScale = d3.scaleLinear().domain([0, w]).range([0, w]);
  //const yScale = d3.scaleLinear().domain([0, h]).range([0, h]);
  const eduScale1 = d3.scaleLinear().domain([1001, 4007]).range([0, 99]);
  const eduScale2 = d3.scaleLinear().domain([4009, 56045]).range([100, 3141]);
  const svg = d3.select("body")
  .append("svg").attr("width", w).attr("height", h).attr("viewBox", [0, 0, 950, 620]);
  
  
  
  
  const projection = d3.geoStream();
  const path = d3.geoPath().projection(projection);
  
  function eduColor(eduLevel){
    if (eduLevel>=50){
    return (50);
    }else if (eduLevel>=40){
    return (60);
    }else if (eduLevel>=30){
    return (70);
    }else if (eduLevel>=20){
    return (80);
    }else if (eduLevel>=10){
    return (90);
    }else if (eduLevel>=0){
    return (100);
    }
  }
  function getEduLevel(id){
    if(id<4008){
        for(let i = Math.floor(eduScale1(id))-100 ; i < (Math.floor(eduScale1(id)) + 100) ; i++){
          if (i>=0&&id==educationJson[i]["fips"]){
            return i;
          }
      }
    }else{
        for(let i = Math.floor(eduScale2(id))-300 ; i < (Math.floor(eduScale2(id))+200) ; i++){
          if (i>=0&&id==educationJson[i]["fips"]){
            return i;
          }
      }
    }
  }
  
  /*
  const states = topojson.feature(countyJson, countyJson.objects.states).features;
  svg.selectAll(".state")
  .data(states).enter().append("path")
  .attr("class","state")
  .attr("d", path)
  .attr("fill","none")
  .attr("stroke","black");
  */
  const counties = topojson.feature(countyJson, countyJson.objects.counties).features;
  svg.selectAll(".county")
  .data(counties).enter().append("path")
  .attr("class","county")
  .attr("d", path)
  .attr("fill",(d)=>"hsl("+(150)+",50%,"+eduColor(educationJson[getEduLevel(d["id"])]["bachelorsOrHigher"])+"%)")
  .attr("data-fips",(d)=>(d["id"]))
  .attr("data-education",(d)=>educationJson[getEduLevel(d["id"])]["bachelorsOrHigher"])
  .attr("data-county",(d)=>educationJson[getEduLevel(d["id"])]["area_name"])
  .attr("data-state",(d)=>educationJson[getEduLevel(d["id"])]["state"])
  .on("mouseover", handleMouseOver)
  .on("mouseout", handleMouseOut)
  ;
  
  const legend = svg.append("g")
  .attr("id", "legend");
for(let i=0;i<6;i++){
  legend.append("rect")
    .attr("x", 950/2 + i*50)
    .attr("y", 25)
    .attr("width", "50px")
    .attr("height", "10px")
    .attr("stroke", "black")
    .style("stroke-width", 1)
    .attr("fill",(d)=>"hsl("+(150)+",50%,"+eduColor(i*10)+"%)");
    legend.append("text").text(i*10+"%")
    .attr("x", 950/2+2 + i*50)
    .attr("y", 20);
  
}
  
   d3.select("body")
    .append("div")
    .attr("id","tooltip")
    .style("visibility","hidden")
    .style("position","absolute")
    .style("border-radius","2px")
    .style("border","1px solid black")
    .style("padding","10px");
  
  function handleMouseOver(d,i){
    d3.select("#tooltip")
      .attr("data-education",d3.select(this).attr("data-education"))
      .style("visibility","visible")
      .style("background-color","white")
      .style("left",event.pageX+0+"px")
      .style("top",event.pageY-45+"px")
      .html(d3.select(this).attr("data-county")+" "+d3.select(this).attr("data-state")+"</br>"+d3.select(this).attr("data-education")+"% with degree");
  }
  function handleMouseOut(){
    d3.select("#tooltip").style("visibility","hidden");
  }
}