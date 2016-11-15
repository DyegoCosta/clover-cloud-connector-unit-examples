var $ = require('jquery');
SimpleCloverConfig = require("./SimpleCloverConfig");

var clover = require("remote-pay-cloud");
var log = clover.Logger.create();
var simpleCloverConfig = new SimpleCloverConfig(log);

TestBase = function(configUrl, friendlyName, progressinfoCallback) {
    this.configUrl = configUrl;
    this.friendlyName = friendlyName;
    this.progressinfoCallback = progressinfoCallback;
};

TestBase.prototype.test = function() {
    this.displayMessage({message: "About to load configuration..."});
    TestBase.simpleCloverConfig.loadCloverConfig(this.configUrl, {friendlyId: this.friendlyName}, this.readyTest.bind(this));
};
TestBase.prototype.readyTest = function(error, configuration) {
    if(error) {
        this.displayMessage({type:"error", message: error});
    } else {
        this.displayMessage({type:"success", message: configuration});
        configuration = this.decorateConfiguration(configuration);
        configuration["friendlyId"] = configuration["friendlyId"] +
          Math.floor(Math.random() * 1000000)
        configuration["allowOvertakeConnection"] = false
        this.connector = new clover.CloverConnectorFactory().createICloverConnector(configuration);
        var connectorListener = this.getCloverConnectorListener(this.connector, this.progressinfoCallback);
        this.connector.addCloverConnectorListener(connectorListener);
        this.connector.initializeConnection();

        // Close the connection cleanly on exit.  This should be done with all connectors.
        $(window).on('beforeunload ', function () {
            try {
                this.connector.dispose();
            } catch (e) {
                console.log(e);
            }
        }.bind(this));
    }
};
TestBase.prototype.displayMessage = function(message) {
    log.info(message);
    if(this.progressinfoCallback) {
        this.progressinfoCallback(message);
    }
};

/**
 * Add any values to the configuration that we need to for the test.
 * @param configuration
 */
TestBase.prototype.decorateConfiguration = function(configuration) {
    configuration.friendlyId = this.friendlyName;
    return configuration;
};

/**
 * abstract
 * Implement for each specific test.
 */
TestBase.prototype.getCloverConnectorListener = function(cloverConnector, progressinfoCallback) {
    return null;
};

TestBase.simpleCloverConfig = simpleCloverConfig;

if ('undefined' !== typeof module) {
    module.exports = TestBase;
}
