//<<<<<<< HEAD
//function TerminalViewModel(loginStateViewModel, settingsViewModel) {
//    var self = this;
//
//    self.loginState = loginStateViewModel;
//    self.settings = settingsViewModel;
//
//    self.log = [];
//
//    self.command = ko.observable(undefined);
//
//    self.isErrorOrClosed = ko.observable(undefined);
//    self.isOperational = ko.observable(undefined);
//    self.isLocked = ko.observable(undefined);
//    self.isPrinting = ko.observable(undefined);
//    self.isPaused = ko.observable(undefined);
//    self.isError = ko.observable(undefined);
//    self.isReady = ko.observable(undefined);
//    self.isLoading = ko.observable(undefined);
//
//    self.autoscrollEnabled = ko.observable(true);
//
//    self.filters = self.settings.terminalFilters;
//    self.filterRegex = undefined;
//
//    self.cmdHistory = [];
//    self.cmdHistoryIdx = -1;
//
//    self.activeFilters = ko.observableArray([]);
//    self.activeFilters.subscribe(function(e) {
//        self.updateFilterRegex();
//        self.updateOutput();
//    });
//
//    self.fromCurrentData = function(data) {
//        self._processStateData(data.state);
//        self._processCurrentLogData(data.logs);
//    };
//
//    self.fromHistoryData = function(data) {
//        self._processStateData(data.state);
//        self._processHistoryLogData(data.logs);
//    };
//
//    self._processCurrentLogData = function(data) {
//        if (!self.log)
//            self.log = [];
//        self.log = self.log.concat(data);
//        self.log = self.log.slice(-300);
//        self.updateOutput();
//    };
//
//    self._processHistoryLogData = function(data) {
//        self.log = data;
//        self.updateOutput();
//    };
//
//    self._processStateData = function(data) {
//        self.isErrorOrClosed(data.flags.closedOrError);
//        self.isOperational(data.flags.operational);
//        self.isLocked(data.flags.locked);
//        self.isPaused(data.flags.paused);
//        self.isPrinting(data.flags.printing);
//        self.isError(data.flags.error);
//        self.isReady(data.flags.ready);
//        self.isLoading(data.flags.loading);
//    };
//
//    self.updateFilterRegex = function() {
//        var filterRegexStr = self.activeFilters().join("|").trim();
//        if (filterRegexStr == "") {
//            self.filterRegex = undefined;
//        } else {
//            self.filterRegex = new RegExp(filterRegexStr);
//        }
//    };
//
//    self.updateOutput = function() {
//        if (!self.log)
//            return;
//
//        var output = "";
//        for (var i = 0; i < self.log.length; i++) {
//            if (self.filterRegex !== undefined && self.log[i].match(self.filterRegex)) continue;
//            output += self.log[i] + "\n";
//        }
//
//        var container = $("#terminal-output");
//        container.text(output);
//
//        if (self.autoscrollEnabled()) {
//            container.scrollTop(container[0].scrollHeight - container.height())
//        }
//    };
//	
//	self.sendCommandWithSafetyPopup = function(){
//		var command = self.command().split(' ').join('');
//		if (!command) {
//            return;
//        }
//		
//		console.log(command);
//		var parts = command.match(/^(M3|M03)(S[0-9.]+)?/i);
//		if(parts !== null){
//		
//			$("#confirmation_dialog .confirmation_dialog_message").text(gettext("The laser will now be enabled. Protect yourself and everybody in the room appropriately before proceeding!"));
//			$("#confirmation_dialog .confirmation_dialog_acknowledge").unbind("click");
//			$("#confirmation_dialog .confirmation_dialog_acknowledge").click(
//					function(e) {
//						e.preventDefault(); 
//						$("#confirmation_dialog").modal("hide"); 
//						self.sendCommand();
//					});
//			$("#confirmation_dialog").modal("show");
//		
//			
//				
//		} else {
//			self.sendCommand();
//		}
//	};
//
//    self.sendCommand = function() {
//        var command = self.command();
//        if (!command) {
//            return;
//        }
//
//        //var re = /^([gmt][0-9]+)(\s.*)?/;
//        var re = /^([gmtfs][0-9]+|\$[cinhgx#$]|[?~!])(.*)?/; // grbl style
//        var commandMatch = command.match(re);
//        if (commandMatch != null) {
//            command = commandMatch[1].toUpperCase() + ((commandMatch[2] !== undefined) ? commandMatch[2].toUpperCase() : "");
//        }
//		
//        if (command) {
//=======
$(function() {
    function TerminalViewModel(parameters) {
        var self = this;

        self.loginState = parameters[0];
        self.settings = parameters[1];

        self.log = ko.observableArray([]);
        self.buffer = ko.observable(300);

        self.command = ko.observable(undefined);

        self.isErrorOrClosed = ko.observable(undefined);
        self.isOperational = ko.observable(undefined);
        self.isPrinting = ko.observable(undefined);
        self.isPaused = ko.observable(undefined);
        self.isError = ko.observable(undefined);
        self.isReady = ko.observable(undefined);
        self.isLoading = ko.observable(undefined);

        self.autoscrollEnabled = ko.observable(true);

        self.filters = self.settings.terminalFilters;
        self.filterRegex = ko.observable();

        self.cmdHistory = [];
        self.cmdHistoryIdx = -1;

        self.displayedLines = ko.computed(function() {
            var regex = self.filterRegex();
            var lineVisible = function(entry) {
                return regex == undefined || !entry.line.match(regex);
            };

            var filtered = false;
            var result = [];
            _.each(self.log(), function(entry) {
                if (lineVisible(entry)) {
                    result.push(entry);
                    filtered = false;
                } else if (!filtered) {
                    result.push(self._toInternalFormat("[...]", "filtered"));
                    filtered = true;
                }
            });

            return result;
        });
        self.displayedLines.subscribe(function() {
            self.updateOutput();
        });

        self.lineCount = ko.computed(function() {
            var total = self.log().length;
            var displayed = _.filter(self.displayedLines(), function(entry) { return entry.type == "line" }).length;
            var filtered = total - displayed;

            if (total == displayed) {
                return _.sprintf(gettext("showing %(displayed)d lines"), {displayed: displayed});
            } else {
                return _.sprintf(gettext("showing %(displayed)d lines (%(filtered)d of %(total)d total lines filtered)"), {displayed: displayed, total: total, filtered: filtered});
            }
        });

        self.autoscrollEnabled.subscribe(function(newValue) {
            if (newValue) {
                self.log(self.log.slice(-self.buffer()));
            }
        });

        self.activeFilters = ko.observableArray([]);
        self.activeFilters.subscribe(function(e) {
            self.updateFilterRegex();
        });

        self.fromCurrentData = function(data) {
            self._processStateData(data.state);
            self._processCurrentLogData(data.logs);
        };

        self.fromHistoryData = function(data) {
            self._processStateData(data.state);
            self._processHistoryLogData(data.logs);
        };

        self._processCurrentLogData = function(data) {
            self.log(self.log().concat(_.map(data, function(line) { return self._toInternalFormat(line) })));
            if (self.autoscrollEnabled()) {
                self.log(self.log.slice(-300));
            }
        };

        self._processHistoryLogData = function(data) {
            self.log(_.map(data, function(line) { return self._toInternalFormat(line) }));
        };

        self._toInternalFormat = function(line, type) {
            if (type == undefined) {
                type = "line";
            }
            return {line: line, type: type}
        };

        self._processStateData = function(data) {
            self.isErrorOrClosed(data.flags.closedOrError);
            self.isOperational(data.flags.operational);
            self.isPaused(data.flags.paused);
            self.isPrinting(data.flags.printing);
            self.isError(data.flags.error);
            self.isReady(data.flags.ready);
            self.isLoading(data.flags.loading);
        };

        self.updateFilterRegex = function() {
            var filterRegexStr = self.activeFilters().join("|").trim();
            if (filterRegexStr == "") {
                self.filterRegex(undefined);
            } else {
                self.filterRegex(new RegExp(filterRegexStr));
            }
            self.updateOutput();
        };

        self.updateOutput = function() {
            if (self.autoscrollEnabled()) {
                self.scrollToEnd();
            }
        };

        self.toggleAutoscroll = function() {
            self.autoscrollEnabled(!self.autoscrollEnabled());
        };

        self.selectAll = function() {
            var container = $("#terminal-output");
            if (container.length) {
                container.selectText();
            }
        };

        self.scrollToEnd = function() {
            var container = $("#terminal-output");
            if (container.length) {
                container.scrollTop(container[0].scrollHeight - container.height())
            }
        };

        self.sendCommand = function() {
            var command = self.command();
            if (!command) {
                return;
            }

            var re = /^([gmt][0-9]+)(\s.*)?/;
            var commandMatch = command.match(re);
            if (commandMatch != null) {
                command = commandMatch[1].toUpperCase() + ((commandMatch[2] !== undefined) ? commandMatch[2] : "");
            }

            if (command) {
                $.ajax({
                    url: API_BASEURL + "printer/command",
                    type: "POST",
                    dataType: "json",
                    contentType: "application/json; charset=UTF-8",
                    data: JSON.stringify({"command": command})
                });

                self.cmdHistory.push(command);
                self.cmdHistory.slice(-300); // just to set a sane limit to how many manually entered commands will be saved...
                self.cmdHistoryIdx = self.cmdHistory.length;
                self.command("");
            }
        };

        self.fakeAck = function() {
//>>>>>>> upstream/maintenance
            $.ajax({
                url: API_BASEURL + "connection",
                type: "POST",
                dataType: "json",
                contentType: "application/json; charset=UTF-8",
                data: JSON.stringify({"command": "fake_ack"})
            });
        };

        self.handleKeyDown = function(event) {
            var keyCode = event.keyCode;

            if (keyCode == 38 || keyCode == 40) {
                if (keyCode == 38 && self.cmdHistory.length > 0 && self.cmdHistoryIdx > 0) {
                    self.cmdHistoryIdx--;
                } else if (keyCode == 40 && self.cmdHistoryIdx < self.cmdHistory.length - 1) {
                    self.cmdHistoryIdx++;
                }

                if (self.cmdHistoryIdx >= 0 && self.cmdHistoryIdx < self.cmdHistory.length) {
                    self.command(self.cmdHistory[self.cmdHistoryIdx]);
                }

                // prevent the cursor from being moved to the beginning of the input field (this is actually the reason
                // why we do the arrow key handling in the keydown event handler, keyup would be too late already to
                // prevent this from happening, causing a jumpy cursor)
                return false;
            }

            // do not prevent default action
            return true;
        };

        self.handleKeyUp = function(event) {
            if (event.keyCode == 13) {
                self.sendCommand();
            }

            // do not prevent default action
            return true;
        };

//<<<<<<< HEAD
//    self.handleKeyUp = function(event) {
//        if (event.keyCode == 13) {
//            self.sendCommandWithSafetyPopup();
//        }
//=======
        self.onAfterTabChange = function(current, previous) {
            if (current != "#term") {
                return;
            }
            if (self.autoscrollEnabled()) {
                self.scrollToEnd();
            }
        };
//>>>>>>> upstream/maintenance

    }

    OCTOPRINT_VIEWMODELS.push([
        TerminalViewModel,
        ["loginStateViewModel", "settingsViewModel"],
        "#term"
    ]);
});