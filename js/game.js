

class Game{
    constructor(){
        this.debug=false;
        
        this.obs=new Observ();
        
        this.onEvent()
        
        this.money=0;
        this.today=new Date(); // backup of the date, to compare
        this.todayPosix=this.today.getTime(); // posix
        
        // default 5min=24h
        this.minForADay=5;
        // on scope l'incrément du timer pour pouvoir le changer à la volée
        this.timerIncr=()=>(86400/(this.minForADay*60)*1000);
        

        // l'objet à sauvegarder, pas de fonction dedans !
        this.current={
            city:'centralCity'
            ,dayZero:this.today.getTime()
            ,day:this.today.getDate()
            ,month:this.today.getMonth()
            ,year:this.today.getFullYear()
            ,dayPassed:0
            ,money:20000000
            ,cart:[]
            ,pocketAmnt:0
            ,pocketDefaultCapacity:50
            ,transport:'feet'
            ,weaponPocketAmnt:0
            ,weaponPocketDefaultCapacity:1
            ,hasBackPack:false
<<<<<<< HEAD
            ,timeSlice:0
            
        }   

=======
            ,bourseSeed:'INITIAL_SEED'
            ,eventLog: []
        }
        
        
>>>>>>> master
        this.modal=new Modal(this);
        this.timer=new Timer(this);
        this.items=new Items(this);
        this.transports=new Transports(this);
        this.cities=new Cities(this);
        this.market=new Market(this);
        this.cart=new Cart(this);
        this.bourse=new Bourse(this);
        this.UI=new Interface(this);
        this.UI.init();
    }

    onEvent() {
        this.obs.sub('logEvent', ({eventName, data}) =>
            this.current.eventLog.push({
                timestamp: this.today.getTime()
                ,eventName
                ,data
            })
        )
    }
    
    getPocketCapacity(){
        let def=this.current.pocketDefaultCapacity;
        
        // bonus transport
        let transportBonus=this.transports.transports[this.current.transport].morePocket;
        
        // Bonus sac à dos (acheté à Carouf city)
        let bagBonus=this.current.hasBackPack?20:0;
        
        return def + transportBonus + bagBonus;
    }
    
    getWeaponPocketCapacity(){
        let def=this.current.weaponPocketDefaultCapacity;
        
        
        return def ;
    }
    
    userFriendlyTime(mixedTime=false){
        if(!mixedTime){
            mixedTime=this.todayPosix;
        }
        let d=new Date(mixedTime);
        let conv=(n)=>TOOLS.padWithZero(n);
        let date=conv((d.getDate()));
        let m=conv(d.getMonth());
        let y=conv(d.getYear()-100);
        let h=conv(d.getHours());
        let mi=conv(d.getMinutes());
        let s=conv(d.getSeconds());
        
        return `<span>${date}/${m}/${y}</span> <span>${h}:${mi}</span>`;
            
    }    
}



let d;
window.onload=()=>{


        
    let g=d=new Game();
    // g.UI.init();
    g.timer.start();
    
}