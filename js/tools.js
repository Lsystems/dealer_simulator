const TOOLS={
    
    // générateur de noeud DOM
    // @param object param:
    //  type string (div): html tag
    //  attr object (void): [html attributes]=[value]
    //  html string (void): the htmlString to insert
    // return created node
    createElement:(param=false)=>{
        let type='div';
        if(param && param.type){
           type=param.type; 
        }
        let a=document.createElement(type);
        if(param && param.attr && typeof param.attr==='object'){
            for(var attr in param.attr){
                let pattr=param.attr[attr];
                a.setAttribute(attr,pattr);
            }
        }
        
        if(param.html && param.html.length){
            a.innerHTML=param.html;
        }
        return a;
    }
    
    // compléter avec des zéros non significatif un [number]
    ,padWithZero:(n)=>n<10?'0'+n:n
    
    // copy profonde d'un objet
    ,cloneObject:function(obj){
        let clone = {};
        for(let i in obj) {
            if(obj[i] != null &&  typeof(obj[i])=="object")
                clone[i] = this.cloneObject(obj[i]);
            else
                clone[i] = obj[i];
        }
        return clone;
    }
    
    // retourne une id unique
    ,getUID:()=>'_' + Math.random().toString(36).substr(2, 9)
    
    // logging avec couleur ;p
    ,log:(str)=>{
        let logLevel=0;
        let styles={
            shared:{
                css:[
                    "color:#fff"
                ]
            }
            ,default:{
                css:[
                    "background:#444"
                ]
            }
           ,notice:{
                css:[
                    "background:rgb(5,169,224)"
                ]
                ,level:0
            }
           ,warn:{
                css:[
                    "background:rgb(255,168,20)"
                ]
                ,level:2
            }
           ,error:{
                css:[
                    "background:rgb(247,0,0)"
                ]
                ,level:3
           }
           
        };
        
        if(typeof str==='string'){
            var s4Key=(str.match(/^[A-Z][^::]+/g));
            var levelStyle=styles.default.css.join(';');
            if(s4Key !==null && s4Key[0] && styles[s4Key[0].toLowerCase()]){
                levelStyle=styles[s4Key[0].toLowerCase()].css.join(';');
            }
			if(styles[s4Key[0].toLowerCase()].level>=logLevel || s4Key===null){
				console.log('%c '+str+' ',levelStyle+';'+styles.shared.css.join(';'));
			}
        }
        else{
            console.log(str);
        }      
    }
}

