import mongoose from 'mongoose';

const recommendationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  surveyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Survey', // ajusta al nombre real de tu encuesta base
    required: true
  },
  result: {
    type: Object, // aquí guardas géneros, canciones, pesos, etc.
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Recommendation', recommendationSchema);
