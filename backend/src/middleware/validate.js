const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// User validation rules
const userValidationRules = () => {
  return [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
  ];
};

// Product validation rules
const productValidationRules = () => {
  return [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('price').isNumeric().withMessage('Price must be a number'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  ];
};

// Order validation rules
const orderValidationRules = () => {
  return [
    body('customerName').trim().notEmpty().withMessage('Customer name is required'),
    body('total').isNumeric().withMessage('Total must be a number'),
    body('status').isIn(['pending', 'completed', 'cancelled']).withMessage('Invalid status'),
  ];
};

module.exports = {
  validate,
  userValidationRules,
  productValidationRules,
  orderValidationRules,
}; 