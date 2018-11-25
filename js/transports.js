class Transports{
    constructor(game){
        this.game=game;
        this.transports={ 
            feet:{
                ico:'walking' // /assets/gameicons/ key
                ,duration:120 // minutes in game
                ,price:0
                ,active:true
                ,displayName:'A pied'
                ,morePocket:0
                ,code:'feet'
            }
            ,bicycle:{
                ico:'cycling'
                ,duration:60
                ,price:2500
                ,active:false
                ,displayName:'Vélo'
                ,morePocket:10
                ,code:'bicycle'
            }
            ,moto:{
                ico:'scooter'
                ,duration:45
                ,price:8000
                ,active:false
                ,displayName:'Scooter'
                ,morePocket:50
                ,code:'moto'
            }
            ,car:{
                ico:'car'
                ,duration:30
                ,price:50000
                ,active:false
                ,displayName:'Voiture'
                ,morePocket:150
                ,code:'car'
            }
            ,helico:{
                ico:'helico'
                ,duration:10
                ,price:420000
                ,active:false
                ,displayName:'Hélicoptère'
                ,morePocket:300
                ,code:'helico'
            }
        }
        
        this.onEvent();
    }

    
    buyTransport(transCode){
        
        let tran=this.transports[transCode];
        let haveEnoughMoney=tran.price<=this.game.current.money;
        if(haveEnoughMoney && tran){
            this.game.current.money-=tran.price;
            tran.active=true;
            return true;
        }
        
        return false;
    }
    
    onEvent(){
        this.game.obs.sub('changeTransport',(d)=>this.changeTransport(d));
    }
    
    changeTransport(transCode){
        
        let ok=true;
        
        let tran=this.transports[transCode];
        
        if(!tran || (tran && !tran.active)){
            ok=false;
        }
        // ici check pour d'autre raison de ne pas pouvoir changer de transport
        // - fourrière
        // - panne 
        // - etc..
        
        if(ok){
            this.game.current.transport=transCode;
            this.game.obs.trigger("enterTransport",transCode);
        }
    }

}