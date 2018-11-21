class Observ{
    constructor(){
        this.obs={}
        
    }
    
    addEvent(eventName){
        try{
            if(this.obs[eventName]){
                throw 'ERROR:: Observer addEvent : ['+eventName+'] :: évènement déjà créé';
            }
            this.obs[eventName]=new Map();
            return this.obs[eventName];
        }catch(e){
            TOOLS.log(e);
            return false;
        }
    }
    
    removeEvent(eventName){
        try{
            if(!this.obs[eventName]){
                throw 'ERROR:: Observer removeEvent : ['+eventName+'] :: évènement inexistant';
            }
            delete this.obs[eventName];
            return true;
        }catch(e){
            TOOLS.log(e);
            return false;
        }
    }    
                 
    /* s'abonne à un évènement dispo, créer l'évènement s'il n'existe pas
        @param eventName : string : le nom de l'évènement auquel on s'abonne
        @param callback : function : la fonction a exécuter lors de l'évènement
        @param opt : object : {
            noRepeat : désinscrit le sub après trigger
            removeAfter : retire l'évènement de la liste après dernière exécution
        }
    */
    sub(eventName=false,callback=false,opt={noRepeat:false,removeAfter:false}){
        try{

            
            if(typeof eventName==='string' && !eventName.length || typeof eventName!=='string'){
                throw 'ERROR:: Observer sub : '+eventName+' est indéfini, string attendu';
            }
            if(typeof callback!='function'){
                throw 'ERROR:: Observer sub : ['+eventName+'] :: callback indéfini ou fonction attendue';
            }
            
            let eventMap=this.obs[eventName];
            
            if(!eventMap){
                eventMap=this.addEvent(eventName);
            }
            let uid=TOOLS.getUID();
            eventMap.set(uid,{callback:callback,opt:opt});
            
            return uid;
        }catch(e){
            TOOLS.log(e);
            return false;
        }
    }    
    
    /* lance un évènement
        @param eventName : string : le nom de l'évènement qu'on déclenche
        @param data : mixed : les données à faire passer le long de l'évènement
    */    
    trigger(eventName,data){
        try{
            if(!this.obs[eventName]){
                throw 'WARN:: Observer trigger : ['+eventName+'] :: évènement indéfini';
            }
            for (let [subId, objCallback] of this.obs[eventName].entries()){
                objCallback.callback(data);
                if(objCallback.opt.noRepeat){
                    this.unsub(eventName,subId);
                }
                if(objCallback.opt.removeAfter){
                    delete this.obs[eventName];
                }
            }
            // log les evenements qui matchent vvv
            if(/^(bourse:|buyItem|sellItem)/.test(eventName))
                // say that you need to log this event elsewhere
                this.trigger('logEvent', {eventName, data})
        }
        catch(e){
            TOOLS.log(e);
        }
    }    
    
    
                 
    /* se désabonne à un évènement dispo
        @param eventName : string : le nom de l'évènement auquel on se désabonne
        @param subId : string : l'identifiant du subscribe qui se désabonne
    */
    unsub(eventName,subId){
        try{
            
            if(!this.obs[eventName]){
                throw 'WARN:: Observer unsub : ['+eventName+'] :: évènement non disponible';
            }
            var ev=this.obs[eventName].delete(subId);
            if(!ev){
                throw 'ERROR::MAV Observer unsub : '+eventName+'=>'+subId+' :: aucun id à désabonner';
            }
            return true;
        }catch(e){
            TOOLS.log(e);
            return false;
        }
    }
    
} // end of class