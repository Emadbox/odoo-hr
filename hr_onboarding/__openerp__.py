# -*- coding: utf-8 -*-
##############################################################################
#
#   www.vertel.se
#
##############################################################################

{
    'name': 'Employee Onboarding',
    'version': '1.1',
    'category': 'Human Resources',
    'licence': 'AGPL-3',
    'description': """
Employee Onboarding
===================

Define stages for onboard personel

This module depends on OpenHRMS

    """,
    'author': 'Vertel AB',
    'website': 'http://www.vertel.se',
    'depends': ['hr_employee_updation','survey','hr_recruitment'],
    'data': [
        'hr_onboarding_view.xml',
        'hr_onboarding_data.xml',
        'security/ir.model.access.csv',
        # ~ 'security/rules.xml',
       ],
    'installable': True,
}

# vim:expandtab:smartindent:tabstop=4:softtabstop=4:shiftwidth=4:
