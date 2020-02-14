odoo.define('hr_attendance_kiosk.greeting_message', function (require) {
"use strict";

var AbstractAction = require('web.AbstractAction');
var core = require('web.core');
var GreetingMessage = require('hr_attendance.greeting_message');
var _t = core._t;

// welcome_message & farewell_message is the 2 functions edited, just translations from English to Swedish.
//~ var GreetingMessage = AbstractAction.extend({
GreetingMessage.include({
    template: 'HrAttendanceGreetingMessage',

    events: {
        "click .o_hr_attendance_button_dismiss": function() { this.do_action(this.next_action, {clear_breadcrumbs: true}); },
    },

    init: function(parent, action) {
        var self = this;
        this._super.apply(this, arguments);
        this.activeBarcode = true;

        // if no correct action given (due to an erroneous back or refresh from the browser), we set the dismiss button to return
        // to the (likely) appropriate menu, according to the user access rights
        if(!action.attendance) {
            this.activeBarcode = false;
            this.getSession().user_has_group('hr_attendance.group_hr_attendance_user').then(function(has_group) {
                if(has_group) {
                    self.next_action = 'hr_attendance.hr_attendance_action_kiosk_mode';
                } else {
                    self.next_action = 'hr_attendance.hr_attendance_action_my_attendances';
                }
            });
            return;
        }

        this.next_action = action.next_action || 'hr_attendance.hr_attendance_action_my_attendances';
        // no listening to barcode scans if we aren't coming from the kiosk mode (and thus not going back to it with next_action)
        if (this.next_action != 'hr_attendance.hr_attendance_action_kiosk_mode' && this.next_action.tag != 'hr_attendance_kiosk_mode') {
            this.activeBarcode = false;
        }

        this.attendance = action.attendance;
        // We receive the check in/out times in UTC
        // This widget only deals with display, which should be in browser's TimeZone
        this.attendance.check_in = this.attendance.check_in && moment.utc(this.attendance.check_in).local();
        this.attendance.check_out = this.attendance.check_out && moment.utc(this.attendance.check_out).local();
        this.previous_attendance_change_date = action.previous_attendance_change_date && moment.utc(action.previous_attendance_change_date).local();

        // check in/out times displayed in the greeting message template.
        this.format_time = 'HH:mm:ss';
        this.attendance.check_in_time = this.attendance.check_in && this.attendance.check_in.format(this.format_time);
        this.attendance.check_out_time = this.attendance.check_out && this.attendance.check_out.format(this.format_time);
        this.employee_name = action.employee_name;
        this.attendanceBarcode = action.barcode;
    },

    start: function() {
        if (this.attendance) {
            this.attendance.check_out ? this.farewell_message() : this.welcome_message();
        }
        if (this.activeBarcode) {
            core.bus.on('barcode_scanned', this, this._onBarcodeScanned);
        }
    },

    welcome_message: function() {
        var self = this;
        var now = this.attendance.check_in.clone();
        this.return_to_main_menu = setTimeout( function() { self.do_action(self.next_action, {clear_breadcrumbs: true}); }, 5000);

        if (now.hours() < 5) {
            this.$('.o_hr_attendance_message_message').append(_t("God natt"));
        } else if (now.hours() < 12) {
            if (now.hours() < 8 && Math.random() < 0.3) {
                if (Math.random() < 0.75) {
                    this.$('.o_hr_attendance_message_message').append(_t("Den som sätter igång först når mest framgång"));
                } else {
                    this.$('.o_hr_attendance_message_message').append(_t("Först till kvarn"));
                }
            } else {
                this.$('.o_hr_attendance_message_message').append(_t("God morgon"));
            }
        } else if (now.hours() < 17){
            this.$('.o_hr_attendance_message_message').append(_t("God eftermiddag"));
        } else if (now.hours() < 23){
            this.$('.o_hr_attendance_message_message').append(_t("God kväll"));
        } else {
            this.$('.o_hr_attendance_message_message').append(_t("God natt"));
        }
        if(this.previous_attendance_change_date){
            var last_check_out_date = this.previous_attendance_change_date.clone();
            if(now - last_check_out_date > 24*7*60*60*1000){
                this.$('.o_hr_attendance_random_message').html(_t("Kul att se dig igen, det var ett tag sedan!"));
            } else {
                if(Math.random() < 0.02){
                    this.$('.o_hr_attendance_random_message').html(_t("Om något är värt att göra, är det värt att göra det bra!"));
                }
            }
        }
    },

    farewell_message: function() {
        var self = this;
        var now = this.attendance.check_out.clone();
        this.return_to_main_menu = setTimeout( function() { self.do_action(self.next_action, {clear_breadcrumbs: true}); }, 5000);

        if(this.previous_attendance_change_date){
            var last_check_in_date = this.previous_attendance_change_date.clone();
            if(now - last_check_in_date > 1000*60*60*12){
                this.$('.o_hr_attendance_warning_message').show().append(_t("<b>Varning! Senaste check in var över 12 timmar sedan.</b><br/>Om detta inte stämmer, var vänligen kontakta HR"));
                clearTimeout(this.return_to_main_menu);
                this.activeBarcode = false;
            } else if(now - last_check_in_date > 1000*60*60*8){
                this.$('.o_hr_attendance_random_message').html(_t("Ännu ett bra arbetspass! Ses snart!"));
            }
        }

        if (now.hours() < 12) {
            this.$('.o_hr_attendance_message_message').append(_t("Ha en trevlig dag!"));
        } else if (now.hours() < 14) {
            this.$('.o_hr_attendance_message_message').append(_t("Ha en trevlig lunch!"));
            if (Math.random() < 0.05) {
                this.$('.o_hr_attendance_random_message').html(_t("Ät frukost som en kung, lunch som en affärsman och kvällsmat som en tiggare"));
            } else if (Math.random() < 0.06) {
                this.$('.o_hr_attendance_random_message').html(_t("Ett äpple om dagen är bra för magen"));
            }
        } else if (now.hours() < 17) {
            this.$('.o_hr_attendance_message_message').append(_t("Ha en god eftermiddag"));
        } else {
            if (now.hours() < 18 && Math.random() < 0.2) {
                this.$('.o_hr_attendance_message_message').append(_t("Morgonstund har guld i mun"));
            } else {
                this.$('.o_hr_attendance_message_message').append(_t("Ha en trevlig kväll"));
            }
        }
    },

    _onBarcodeScanned: function(barcode) {
        var self = this;
        if (this.attendanceBarcode !== barcode){
            if (this.return_to_main_menu) {  // in case of multiple scans in the greeting message view, delete the timer, a new one will be created.
                clearTimeout(this.return_to_main_menu);
            }
            core.bus.off('barcode_scanned', this, this._onBarcodeScanned);
            this._rpc({
                    model: 'hr.employee',
                    method: 'attendance_scan',
                    args: [barcode, ],
                })
                .then(function (result) {
                    if (result.action) {
                        self.do_action(result.action);
                    } else if (result.warning) {
                        self.do_warn(result.warning);
                        setTimeout( function() { self.do_action(self.next_action, {clear_breadcrumbs: true}); }, 5000);
                    }
                }, function () {
                    setTimeout( function() { self.do_action(self.next_action, {clear_breadcrumbs: true}); }, 5000);
                });
        }
    },

    destroy: function () {
        core.bus.off('barcode_scanned', this, this._onBarcodeScanned);
        clearTimeout(this.return_to_main_menu);
        this._super.apply(this, arguments);
    },
});

//~ core.action_registry.add('hr_attendance_greeting_message', GreetingMessage);

return GreetingMessage;

});