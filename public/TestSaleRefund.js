var sdk = require("remote-pay-cloud-api");
var ExampleCloverConnectorListener = require("./ExampleCloverConnectorListener.js");
var clover = require("remote-pay-cloud");
var TestBase = require("./TestBase.js");

/* Start: Test a sale */
/**
 * A test of the sale functionality.
 *
 * @type {ExampleCloverConnectorListener}
 */
var SaleRefundExampleCloverConnectorListener = function (cloverConnector, progressinfoCallback) {
    ExampleCloverConnectorListener.call(this, cloverConnector, progressinfoCallback);
    this.cloverConnector = cloverConnector;
    this.progressinfoCallback = progressinfoCallback;
};

SaleRefundExampleCloverConnectorListener.prototype = Object.create(ExampleCloverConnectorListener.prototype);
SaleRefundExampleCloverConnectorListener.prototype.constructor = SaleRefundExampleCloverConnectorListener;

SaleRefundExampleCloverConnectorListener.prototype.onReady = function (merchantInfo) {
    ExampleCloverConnectorListener.prototype.onReady.call(this, merchantInfo);
    /*
     The connector is ready, create a sale request and send it to the device.
     */
    var saleRequest = new sdk.remotepay.SaleRequest();
    saleRequest.setExternalId(clover.CloverID.getNewId());
    saleRequest.setAmount(10000);
    this.displayMessage({message: "Sending sale", request: saleRequest});
    this.cloverConnector.sale(saleRequest);
};

SaleRefundExampleCloverConnectorListener.prototype.onSaleResponse = function (response) {
    /*
     The sale is complete.  It might be canceled, or successful.  This can be determined by the
     values in the response.
     */
    this.displayMessage({message: "Sale response received", response: response});
    if (!response.getIsSale()) {
        this.displayMessage({error: "Response is not a sale!"});
    }
    var request = new sdk.remotepay.RefundPaymentRequest();

    request.setOrderId(response.getPayment().getOrder().getId());
    request.setPaymentId(response.getPayment().getId());
    request.setFullRefund(true);

    this.cloverConnector.refundPayment(request);
};

/**
 * Will be called after a refund payment request and contains the Refund if successful. The Refund contains the original paymentId as reference
 * @memberof remotepay.ICloverConnectorListener
 *
 * @param {remotepay.RefundPaymentResponse} response
 * @return void
 */
SaleRefundExampleCloverConnectorListener.prototype.onRefundPaymentResponse = function (response) {
    this.displayMessage({message: "RefundPaymentResponse received", response: response});
    if (!response.getSuccess()) {
        this.displayMessage({message: "RefundPaymentResponse,  !!! something is wrong, this failed !!!"});
    }

    // Always call this when your test is done, or the device may fail to connect the
    // next time, because it is already connected.
    this.testComplete();
};

/**
 * Used in the test to help identify where messages come from.
 * @returns {string}
 */
SaleRefundExampleCloverConnectorListener.prototype.getTestName = function () {
    return "Test Refund Full Payment";
};
/**
 * A very simple subclass of the tests that specifies the listener (see above)
 * that defines the test flow.
 * @type {TestBase}
 */
TestSaleRefund = function (configUrl, friendlyName, progressinfoCallback) {
    TestBase.call(this, configUrl, friendlyName, progressinfoCallback);
};

TestSaleRefund.prototype = Object.create(TestBase.prototype);
TestSaleRefund.prototype.constructor = TestSaleRefund;

TestSaleRefund.prototype.getCloverConnectorListener = function (cloverConnector) {
    return new SaleRefundExampleCloverConnectorListener(cloverConnector, progressinfoCallback);
};

/**
 * Attach the test of a sale to the testbase to facilitate calling from the main page.
 * @param configUrl
 * @param progressinfoCallback
 */
TestBase.TestSaleRefund = function (configUrl, progressinfoCallback) {
    var testObj = new TestSaleRefund(configUrl, "test", progressinfoCallback);
    testObj.test();
};

if ('undefined' !== typeof module) {
    module.exports = TestSaleRefund;
}
