
ortmtApp.alertTool = function(opt_options) {

  var options = opt_options || {};
  var this_ = this;
  var messageHolder = document.createElement('span');
  $(messageHolder).attr({ "id":'alert_placeholder'});

  ol.control.Control.call(this, {
    element: messageHolder,
    target: options.target
  });
  
};
ol.inherits(ortmtApp.alertTool, ol.control.Control);

ortmtApp.alertTool.show = function(opt_options) {
      var options = opt_options || {msg : '', level : ''};
      var level = options.level || 'info';
      var message = options.msg || 'pas de message ?';
      $('#alert_placeholder').append('<div id="message"><div style="padding: 5px;"><div id="alertdiv" class="alert alert-' + level + '"><a class="close" data-dismiss="alert">×</a><span>'+message+'</span></div></div></div>');
      setTimeout(function() {$("#alertdiv").remove();}, 4000);
    };
