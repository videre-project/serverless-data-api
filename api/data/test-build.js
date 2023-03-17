import run_build from '../../scripts/vercel/run-build.js';


export default async (req, res) => {
  await run_build();
  return res.send({
    status: 'success',
    message: 'Data is newly generated.',
  });
};