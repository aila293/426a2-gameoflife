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
    $("#grid").on("click", ".cell", mouseHandler);
    
    $('body').mousedown(function() {
        isMouseDown = true;
    }).mouseup(function() {
        isMouseDown = false;
    });
    
    $( "#grid" ).on("mouseenter", ".cell", function( e ) {
        if (isMouseDown){
            mouseHandler(e, this);
        }
    });
    
    $("body").keydown(function(e){
        if (e.which==32){
            e.preventDefault();
            toggleAutomation();
        } else if (e.which==90){
            resetEmpty();
        } else if (e.which==88){
            resetRandom();
        } else if (e.which==38){
            step();
        }
    });
}

function mouseHandler(e){
    var el = e.target;
    if (e.ctrlKey){
        $(el).removeClass("alive");
    } else if (e.shiftKey){
        $(el).addClass("alive").addClass("has-lived");
    } else {
        $(el).toggleClass("alive").addClass("has-lived");
    }    
}

function setSliderDisplays(){
    $(" input[type='range']").each(function(i,el){
        $(this).next().text("("+this.value+")");
        
        this.onmousemove=function(){$(this).next().text("("+this.value+")")};
    });
}

function generateGrid(rows, cols){
    $("#grid").children().remove();  
    
   for (var i=0;i<rows;i++){
        var row = document.createElement("div");  
        row.style.width = (12*cols) + "px";
              
        for (var j=0;j<cols;j++){
            var cell = document.createElement("span");
            cell.className = "cell";
            row.appendChild(cell);
        }
        
        $("#grid")[0].appendChild(row);
    }
}

function enforceParameters(){
        
    $("input[name='r']").on("change", function(){
        var temp_r = this.value;
        $(this).nextAll("input").each(function(){
           this.max = 4*temp_r*temp_r + 4*temp_r -1;
        });
    });
    
    $("input[name='o']").on("change", function(){
        var temp_o = this.value;
        $("input[name='l']")[0].max = temp_o;
    });
    
    $("input[name='gmax']").on("change", function(){
        var temp_gmax = this.value;
        $("input[name='gmin']")[0].max = temp_gmax;
    });
}

function setButtonHandlers(){
           
    $("#reset").click(resetEmpty);
    
    $("#random").click(resetRandom);
    
    $("#automation").click(toggleAutomation);
    
    $("#advance").click(step);
    
    $("#new-grid").click(function(){
        var inputs = $("aside input");
        generateGrid(inputs[0].value, inputs[1].value);
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
        timer = setInterval(step, $("input[name='step']").val());
        $("#advance").css("visibility", ["hidden"]);
    }
    automationOn = !automationOn;
}

//STEPPING FUNCTIONS

var r, o, l, gmax, gmin;
var wraparound;
var always_alive;

function getConditions(){
    var inputs = $("aside input");
    r = inputs[3].value;
    o = inputs[4].value;
    l = inputs[5].value;
    gmax = inputs[6].value;
    gmin = inputs[7].value; 
    
    var options = $("input[name='edge']");
    wraparound = options[2].checked;
    always_alive = options[1].checked;
}

var cells;
function step(){
    cells=[];

    getConditions();
    
    $("#grid div").each(function(){
        var row = [];
        $(this).children().each(function(){
            row.push($(this).is(".alive"));
        });
        cells.push(row);
    });
        
    for (var i=0;i<cells.length;i++){
    for (var j=0;j<cells[0].length;j++){
                
        var alive_count = 0;

        for (var i_off = 0-r; i_off<=r; i_off++){
        for (var j_off = 0-r; j_off<=r; j_off++){

            if (i_off ==0 && j_off ==0){
                continue;
            }

            try {                
                if (getCell(i+i_off, j+j_off)){
                    alive_count++;
                } 
            }catch(err){
                
            }
        }}
        determineFate(i, j, alive_count);
                
    }}
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
    }
   // console.log(i+" "+j);

    return cells[i][j];
}

function determineFate(i, j, alive){
    var cell = $($("#grid div")[i]).children()[j];
    if (alive<l || alive>o){
        $(cell).removeClass("alive");
    } else if(alive>=gmin && alive<=gmax){
        $(cell).addClass("alive").addClass("has-lived");
    }
}
