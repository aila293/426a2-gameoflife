$(document).ready(function(){

    setClickHandlers();

    setSliderDisplays();
    
    enforceParameters();
    
    setButtonHandlers();
        
    generateGrid(20,20);
    
});


//SETUP FUNCTIONS
var isMouseDown = false;
function setClickHandlers(){
    $("body")
        .on("click", ".cell", mouseHandler)
        .on("mouseenter", ".cell", function( e ) {
            if (isMouseDown){
                mouseHandler(e, this);
            }
        })
            
        .mousedown(function() {
            isMouseDown = true;
        })
        .mouseup(function() {
            isMouseDown = false;
        })
            
        .keydown(function(e){
            if (e.which==32){   //space
                e.preventDefault();
                toggleAutomation();
            } else if (e.which==90){ //Z
                resetEmpty();
            } else if (e.which==88){ //X
                resetRandom();
            } else if (e.which==38){ //up arrow
                step();
            }
        });
}

function mouseHandler(e){
    if (e.ctrlKey){
        $(e.target).removeClass("alive");
    } else if (e.shiftKey){
        $(e.target).addClass("alive").addClass("has-lived");
    } else {
        $(e.target).toggleClass("alive").addClass("has-lived");
    }    
}

function setSliderDisplays(){
    $(" input[type='range']").each(function(i,el){
        $(this).next().text("("+this.value+")");
        
        this.onmousemove=function(){$(this).next().text("("+this.value+")")};
    });
}

var $rows;
function generateGrid(rows, cols){
    $("#grid").remove();  
    $("main").append("<div id='grid'></div>");
    var grid = $("#grid")[0];
    
   for (var i=0;i<rows;i++){
        var row = document.createElement("div");  
        row.style.width = (12*cols) + "px";
              
        for (var j=0;j<cols;j++){
            var cell = document.createElement("span");
            cell.className = "cell";
            row.appendChild(cell);
        }
        
        grid.appendChild(row);
    }
    $rows = $("#grid div");
}

var parameters;
function enforceParameters(){        
    parameters = $("aside input");
    
    $(parameters[3]).on("change", function(){
        var temp_r = this.value;
        $(this).nextAll("input").each(function(){
           this.max = 4*temp_r*temp_r + 4*temp_r -1;
        });
    });
    
    $(parameters[4]).on("change", function(){
        var temp_o = this.value;
        $(parameters[5])[0].max = temp_o;
    });
    
    $(parameters[6]).on("change", function(){
        var temp_gmax = this.value;
        $(parameters[7])[0].max = temp_gmax;
    });
}

function setButtonHandlers(){
           
    $("#reset").click(resetEmpty);
    
    $("#random").click(resetRandom);
    
    $("#automation").click(toggleAutomation);
    
    $("#advance").click(step);
    
    $("#new-grid").click(function(){
        generateGrid(parameters[0].value, parameters[1].value);
    });

}

function resetEmpty(){
    $(".cell").each(function(){
        $(this).removeClass("has-lived").removeClass("alive");
    });
}
function resetRandom(){
    var odds = Math.random();
    $(".cell").each(function(){
        if (Math.random()<odds){
            $(this).removeClass("alive").removeClass("has-lived");
        } else {
            $(this).addClass("alive").addClass("has-lived");      
        }
    });  
}

var automationOn = false;
var timer;
function toggleAutomation(){
    if (automationOn) {
        $("#automation").text("Turn Automation On");
        clearInterval(timer);
        $("#advance").css("visibility", ["visible"]);
    } else {
        $("#automation").text("Turn Automation Off");
        timer = setInterval(step, parameters[2].value);
        $("#advance").css("visibility", ["hidden"]);
    }
    automationOn = !automationOn;
}

//STEPPING FUNCTIONS

var r, o, l, gmax, gmin;
var wraparound;
var always_alive;

function getConditions(){
    r = parameters[3].value;
    o = parameters[4].value;
    l = parameters[5].value;
    gmax = parameters[6].value;
    gmin = parameters[7].value; 
    
    always_alive = parameters[9].checked;
    wraparound = parameters[10].checked;
}

var cells;
function step(){
    cells=[];

    getConditions();
    
    $rows.each(function(){
        var row = [];
        $(this).children().each(function(){
            row.push($(this).is(".alive"));
                //store states, not elements, to prevent changes while iterating
        });
        cells.push(row);
    });
    //console.log("array done");
        
    for (var i=0;i<cells.length;i++){
    for (var j=0;j<cells[0].length;j++){
                
        var alive_count = 0;

        for (var i_off = 0-r; i_off<=r; i_off++){
        for (var j_off = 0-r; j_off<=r; j_off++){

            if (i_off ==0 && j_off ==0){
                continue;
            }
   
            if (getCell(i+i_off, j+j_off)){
                alive_count++;
                //console.log(i_off+" "+j_off);
            } 
        }}
        //console.log(alive_count);
        determineFate(i, j, alive_count);
                
    }}
   // console.log("fates done");
}
        
function getCell(i,j){
    //console.log(i+" "+j);
    
    if (wraparound){
        if (i>=cells.length){
            i -= cells.length;
        } 
        if (j>=cells[0].length){
            j -= cells.length;
        }
        if (j<0){
            j += cells[0].length;
        }
        if (i<0){
            i += cells.length;
        }
    }  else if (i>=cells.length || j>=cells[0].length || j<0 || i<0){
        if (always_alive){
            return true;            
        } else {
            return false;
        }
    }
   // console.log(i+" "+j);

    return cells[i][j];
}

function determineFate(i, j, alive){
    var cell = $($rows[i]).children()[j];
    if (alive<l || alive>o){
        $(cell).removeClass("alive");
    } else if(alive>=gmin && alive<=gmax){
        $(cell).addClass("alive").addClass("has-lived");
    }
}
