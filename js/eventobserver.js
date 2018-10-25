    
     // créer un observateur pour le module
    createObserver(moduleId){
        if(!this.observers[moduleId]){
            var that=this;
            var obs=this.observers[moduleId]={
                // la bibliothèque d'évènement
                events:{}
                ,mavId:moduleId
                /* ajoute un évènement disponible
                    @param eventName : string : le nom de l'évènement que l'on veut créer
                */
                ,add:function(eventName){
                    try{
                        if(this.events[eventName]){
                            throw 'ERROR::MAV Observer eventAdd : ['+eventName+'] :: évènement déjà créé';
                        }
                        this.events[eventName]=new Map();
                        return true;
                    }catch(e){
                        that.log(e);
                        return false;
                    }
                }
                
                /* retire un évènement disponible
                    @param eventName : string : le nom de l'évènement qu'on supprime
                */
                ,remove:function(eventName){
                    try{
                        if(!this.events[eventName]){
                            throw 'ERROR::MAV Observer eventAdd : ['+eventName+'] :: évènement inexistant';
                        }
                        delete this.events[eventName];
                        return true;
                    }catch(e){
                        that.log(e);
                        return false;
                    }
                }
                
                 
                /* s'abonne à un évènement dispo
                    @param eventName : string : le nom de l'évènement auquel on s'abonne
                    @param modId : string : l'identifiant du module qui s'abonne (mavId)
                    @param callback : function : la fonction a exécuter à l'évènement
                    @param noRepeat : bool : si on se désabonne après l'exécution de l'évènement
                */
                ,subscribe:function(param={}){
                    try{
                        var eventName=param.eventName,
                        modId=param.modId,
                        callback=param.callback,
                        noRepeat=param.noRepeat;
                        
                        if(!this.events[eventName]){
                            throw 'ERROR::MAV Observer eventSubscribe : ['+eventName+'] :: abonnement non disponible';
                        }
                        if(typeof callback!='function'){
                            throw 'ERROR::MAV Observer eventSubscribe : ['+eventName+'] :: callback indéfini ou fonction attendue';
                        }
                        if(typeof modId!='string' || modId.length===0){
                            throw 'ERROR::MAV Observer eventSubscribe : ['+eventName+'] :: identifiant module indéfini';
                        }
                        
                        var noRP=false;
                        if(noRepeat && (noRepeat===1 || noRepeat===true)){
                            noRP=true;
                        }
                        
                        this.events[eventName].set(modId,{callback:callback,noRepeat:noRP});
                        
                        return true;
                    }catch(e){
                        that.log(e);
                        return false;
                    }
                }
                
                 
                /* se désabonne à un évènement dispo
                    @param eventName : string : le nom de l'évènement auquel on se désabonne
                    @param moduleId : string : l'identifiant du module qui se désabonne (mavId)
                */
                ,unsubscribe:function(eventName,moduleId){
                    try{
                        
                        if(!this.events[eventName]){
                            throw 'ERROR::MAV Observer eventSubscribe : ['+eventName+'] :: abonnement non disponible';
                        }
                        var ev=this.events[eventName].delete(moduleId);
                        if(!ev){
                            throw 'ERROR::MAV Observer eventUnSubscribe : '+eventName+'=>'+moduleId+' :: aucun module à désabonner';
                        }
                        return true;
                    }catch(e){
                        that.log(e);
                        return false;
                    }
                }
                
                /* lance un évènement
                    @param eventName : string : le nom de l'évènement qu'on déclenche
                    @param data : mixed : les données à faire passer le long de l'évènement
                */
                ,fire:function(eventName,data){
                    if(this.events[eventName]){
                        for (var [moduleId, objCallback] of this.events[eventName].entries()){
                            objCallback.callback(data,this.mavId);
                            if(objCallback.noRepeat){
                                this.unsubscribe(eventName,moduleId);
                            }
                        }
                    }
                }
                
            };
            return obs;
        }
        this.log('ERROR::MAV createObserver : '+moduleId+' observateur déjà créé');


    }   