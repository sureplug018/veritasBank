const Card = require('../models/cardModel');

exports.freezeCard = async (req, res) => {
  const { cardId } = req.params;

  if (!cardId) {
    return res.status(400).json({
      status: 'fail',
      message: 'Card Id not found',
    });
  }

  try {
    const card = await Card.findByIdAndUpdate(cardId, { status: 'frozen' });

    return res.status(200).json({
      status: 'success',
      data: {
        card,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.unFreezeCard = async (req, res) => {
  const { cardId } = req.params;

  if (!cardId) {
    return res.status(400).json({
      status: 'fail',
      message: 'Card Id not found',
    });
  }

  try {
    const card = await Card.findByIdAndUpdate(cardId, { status: 'active' });

    return res.status(200).json({
      status: 'success',
      data: {
        card,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: 'fail',
      message: err.message,
    });
  }
};
