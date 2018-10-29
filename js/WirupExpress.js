"use strict";
var wirup = function() {};
wirup.prototype = function() {
    var _getElement = function(element_id) {
            return document.getElementById(element_id);
        },
        _dataStore = {},
        _components = {},
        _registerComponent = (componentName, template) => {
            _components[componentName] = template
        },
        _registerData = (dataItemName, value) => {
            _dataStore[dataItemName] = value
        },
        _renderComponents = () => {
            return new Promise(function(resolve, reject) {
                var _viewHTML = '';
                document.querySelectorAll('[datasource]').forEach((_component)=>{
                    _viewHTML = _buildComponent(_component.tagName.toLowerCase(), _component.getAttribute('datasource'))
                    _component.innerHTML = _viewHTML;
                });
                resolve();
            });
        },
        _updateComponentsByDataSourceName = (dataSourceName) => {
            document.getElementsByTagName('body')[0].querySelectorAll('[datasource="' + dataSourceName + '"]').forEach((elem)=> {
                elem.innerHTML = _buildComponent(elem.tagName.toLowerCase(), dataSourceName);
            });
        },
        _buildComponent = (componentName, datasourceName) => {
            let output = '';
            var dataSourceType = typeof _dataStore[datasourceName];
            switch (dataSourceType) {
                case ('object'):
                    output = _dataStore[datasourceName].map((item, i) => {
                        
                        return _components[componentName](item);
                    });
                    break;
                case ('string'):
                    output = _components[componentName](_dataStore[datasourceName]);
                    break;
            }
            return output.join("");
        },
        _buildComponents = (componentNames, datasourceNames) => {
            let output = '';
            componentNames.forEach((componentName, index) => {
                dataSourceType = typeof _dataStore[datasourceNames[index]];
                switch (dataSourceType) {
                    case ('object'):
                        output = _dataStore[datasourceNames[index]].map((item, i) => {
                            return _components[componentName](item);
                        });
                        break;
                    case ('string'):
                        output = _components[componentName](_dataStore[datasourceNames[index]]);
                        break;
                }
            });
            return output.join("");
        },
        _watchDataModel = function() {
            var _dataSnapShotList = {}
            setInterval(function() {
                for (var key in _dataStore) {
                    var stringified = JSON.stringify(window['wuObject']['dataStore'][key]);
                    if (typeof _dataSnapShotList[key] == 'undefined') {
                        _dataSnapShotList[key] = stringified;
                    }
                    if (_dataSnapShotList[key] != stringified) {
                        _dataSnapShotList[key] = stringified;
                        _updateComponentsByDataSourceName(key);
                    }
                }
            }, 3500);
        },
        _get_keys = function(obj) {
            for (var k in obj) {
                if (typeof obj[k] == "object" && obj[k] !== null)
                    _get_keys(obj[k]);
                _key_list.push(obj[k]);
            }
        },
        _jsonize = function(objectName) {
            try {
                return JSON.parse(window[objectName]);
            } catch (e) {
                return window[objectName];
            }
        },
        _loadScript = function(scriptPath) {
            return new Promise((resolve, reject)=>{   
                var _newScript = document.createElement('script');
                _newScript.type = 'text/javascript';
                _newScript.src = scriptPath + '?' + (new Date).getTime();
                document.getElementsByTagName('head')[0].appendChild(_newScript);
                _newScript.onload = ()=>{ 
                    resolve();
                };
                _newScript.onabort = ()=>{ 
                    reject();
                };
            });
        },
        _init = () => {
            _loadScript('components/components.js').then(()=>{
                _renderComponents();
            });
            _watchDataModel();
        };
    return {
        wu: _getElement,
        jsonize: _jsonize,
        loadScript: _loadScript,
        registerComponent: _registerComponent,
        buildComponent: _buildComponent,
        buildComponents: _buildComponents,
        registerData: _registerData,
        dataStore: _dataStore,
        components: _components,
        init: _init
    };
}();
window.wuObject = new wirup();