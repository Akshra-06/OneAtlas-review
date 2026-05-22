/**
 * Template System Exports
 * Central export point for template-based generation system
 */

export { templateRegistry, Template, TemplateMatch } from './template-registry';
export { templateModifier, ModificationRequest, ModificationResult } from './template-modifier';
export { templateBasedGenerator, TemplateBasedGenerator } from './template-generator';

// Import templates to register them
import './healthcare/patient.validation.template';
import './healthcare/appointment.validation.template';
import './healthcare/doctor.validation.template';
import './crm/customer.validation.template';
import './crm/lead.validation.template';
