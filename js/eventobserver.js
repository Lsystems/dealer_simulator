    
     // cr�er un observateur pour le module
    createObserver(moduleId){
        if(!this.observers[moduleId]){
            var that=this;
            var obs=this.observers[moduleId]={
                // la biblioth�que d'�v�nement
                events:{}
                ,mavId:moduleId
                /* ajoute un �v�nement disponible
                    @param eventName : string : le nom de l'�v�nement que l'on veut cr�er
                */
                ,add:function(eventName){
                    try{
                        if(this.events[eventName]){
                            throw 'ERROR::MAV Observer eventAdd : ['+eventName+'] :: �v�nement d�j� cr��';
                        }
                        this.events[eventName]=new Map();
                        return true;
                    }catch(e){
                        that.log(e);
                        return false;
                    }
                }
                
                /* retire un �v�nement disponible
                    @param eventName : string : le nom de l'�v�nement qu'on supprime
                */
                ,remove:function(eventName){
                    try{
                        if(!this.events[eventName]){
                            throw 'ERROR::MAV Observer eventAdd : ['+eventName+'] :: �v�nement inexistant';
                        }
                        delete this.events[eventName];
                        return true;
                    }catch(e){
                        that.log(e);
                        return false;
                    }
                }
                
                 
                /* s'abonne � un �v�nement dispo
                    @param eventName : string : le nom de l'�v�nement auquel on s'abonne
                    @param modId : string : l'identifiant du module qui s'abonne (mavId)
                    @param callback : function : la fonction a ex�cuter � l'�v�nement
                    @param noRepeat : bool : si on se d�sabonne apr�s l'ex�cution de l'�v�nement
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
                            throw 'ERROR::MAV Observer eventSubscribe : ['+eventName+'] :: callback ind�fini ou fonction attendue';
                        }
                        if(typeof modId!='string' || modId.length===0){
                            throw 'ERROR::MAV Observer eventSubscribe : ['+eventName+'] :: identifiant module ind�fini';
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
                
                 
                /* se d�sabonne � un �v�nement dispo
                    @param eventName : string : le nom de l'�v�nement auquel on se d�sabonne
                    @param moduleId : string : l'identifiant du module qui se d�sabonne (mavId)
                */
                ,unsubscribe:function(eventName,moduleId){
                    try{
                        
                        if(!this.events[eventName]){
                            throw 'ERROR::MAV Observer eventSubscribe : ['+eventName+'] :: abonnement non disponible';
                        }
                        var ev=this.events[eventName].delete(moduleId);
                        if(!ev){
                            throw 'ERROR::MAV Observer eventUnSubscribe : '+eventName+'=>'+moduleId+' :: aucun module � d�sabonner';
                        }
                        return true;
                    }catch(e){
                        that.log(e);
                        return false;
                    }
                }
                
                /* lance un �v�nement
                    @param eventName : string : le nom de l'�v�nement qu'on d�clenche
                    @param data : mixed : les donn�es � faire passer le long de l'�v�nement
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
        this.log('ERROR::MAV createObserver : '+moduleId+' observateur d�j� cr��');


    }   