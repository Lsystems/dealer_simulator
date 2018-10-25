class Transports{
    constructor(game){
        this.game=game;
        this.transports={
            feet:{
                ico:'walking' // font awesome icon
                ,duration:120 // minutes in game
                ,price:0
                ,active:true
                ,displayName:'A pied'
                ,morePocket:0
            }
            ,bicycle:{
                ico:'bicycle'
                ,duration:60
                ,price:2500
                ,active:false
                ,displayName:'Vélo'
                ,morePocket:10
            }
            ,moto:{
                ico:'motorcycle'
                ,duration:30
                ,price:8000
                ,active:false
                ,displayName:'Moto'
                ,morePocket:50
            }
            ,car:{
                ico:'car-side'
                ,duration:30
                ,price:50000
                ,active:false
                ,displayName:'Voiture'
                ,morePocket:150
            }
            ,helico:{
                ico:'helicopter'
                ,duration:10
                ,price:420000
                ,active:false
                ,displayName:'Hélicoptère'
                ,morePocket:300
            }
        }
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
    
    changeTransport(transCode){
        
        
        console.log('change '+transCode);
        let tran=this.transports[transCode];
        if(tran && tran.active){
            let old=(()=>this.game.current.transport)();
            this.game.current.transport=transCode;
            return {status:true,old:old};
        }
        let reason='Véhicule indisponible';
        
        // ici check pour d'autre raison
        // - fourrière
        // - panne 
        // - etc..
        
        return {status:false,reason:reason};
    }

}