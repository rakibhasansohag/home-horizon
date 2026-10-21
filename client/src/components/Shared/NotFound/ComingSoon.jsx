import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'react-toastify';

export default function ComingSoon() {
	const [email, setEmail] = useState('');
	const [sent, setSent] = useState(false);
	const [busy, setBusy] = useState(false);
	const navigate = useNavigate?.() ?? (() => {});

	function handleSubmit(e) {
		e.preventDefault();
		if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
			return toast.error('Please enter a valid email');
		}
		setBusy(true);
		// simulate API call (replace with axios POST when backend ready)
		setTimeout(() => {
			setBusy(false);
			setSent(true);
			setEmail('');
		}, 900);
	}

	return (
		<div className='min-h-[70vh] flex items-center justify-center p-6 bg-background text-foreground'>
			<div className='max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center'>
				{/* LEFT: copy + form */}
				<section className='p-6 rounded-2xl bg-card shadow-xl border border-border/60'>
					<div className='flex items-start gap-4'>
						<div className='w-14 h-14 rounded-lg flex items-center justify-center bg-primary/10 text-primary text-2xl'>
							🚧
						</div>
						<div className='flex-1'>
							<h1 className='text-3xl sm:text-4xl font-extrabold leading-tight'>
								Something great is coming
							</h1>
							<p className='mt-2 text-sm text-muted-foreground'>
								We’re working hard to finish the new feature. Sign up to get
								notified when it’s ready.
							</p>

							<div className='mt-6 grid gap-4'>
								<form onSubmit={handleSubmit} className='flex gap-3'>
									<label htmlFor='email' className='sr-only'>
										Email
									</label>
									<input
										id='email'
										type='email'
										placeholder='you@company.com'
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										className='flex-1 px-4 py-3 rounded-lg border border-border/30 bg-input focus:outline-none focus:ring-2 focus:ring-primary'
										aria-label='Email for notification'
										disabled={busy || sent}
									/>
									<button
										type='submit'
										disabled={busy || sent}
										className='px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold disabled:opacity-60'
									>
										{busy ? 'Sending…' : sent ? 'Subscribed ✓' : 'Notify me'}
									</button>
								</form>

								<div className='flex gap-3 items-center'>
									<button
										onClick={() => navigate('/')}
										className='px-3 py-2 rounded-md border border-border/30 bg-transparent text-sm'
									>
										Back to Home
									</button>
									<Link
										to='/dashboard'
										className='text-sm text-primary hover:underline'
									>
										Go to Dashboard
									</Link>
								</div>

								<p className='text-xs text-muted-foreground'>
									You’ll receive an email when this feature is launched. We
									don’t spam — promise.
								</p>
							</div>
						</div>
					</div>
				</section>

				{/* RIGHT: animated construction scene */}
				<aside className='p-6 rounded-2xl bg-card shadow-xl border border-border/60 flex items-center justify-center'>
					<div className='w-full max-w-md'>
						<div className='relative flex flex-col items-center'>
							<svg
								viewBox='0 0 560 360'
								className='w-full h-auto'
								xmlns='http://www.w3.org/2000/svg'
								aria-hidden
							>
								{/* sky / clouds (animated) */}
								<defs>
									<linearGradient id='glass' x1='0' x2='0' y1='0' y2='1'>
										<stop
											offset='0%'
											stopColor='var(--primary)'
											stopOpacity='0.08'
										/>
										<stop
											offset='100%'
											stopColor='var(--card)'
											stopOpacity='0.02'
										/>
									</linearGradient>
								</defs>

								<rect x='0' y='0' width='560' height='360' fill='url(#glass)' />

								<g className='clouds' fill='var(--card)'>
									<ellipse
										className='cloud c1'
										cx='120'
										cy='50'
										rx='58'
										ry='22'
									/>
									<ellipse
										className='cloud c2'
										cx='320'
										cy='35'
										rx='70'
										ry='24'
									/>
									<ellipse
										className='cloud c3'
										cx='480'
										cy='70'
										rx='44'
										ry='18'
									/>
								</g>

								{/* ground */}
								<rect
									x='0'
									y='300'
									width='560'
									height='60'
									fill='var(--sidebar)'
								/>

								{/* building blocks */}
								<g className='building' transform='translate(260,110)'>
									<rect
										className='block block-large'
										x='0'
										y='110'
										width='180'
										height='120'
										rx='8'
									/>
									<rect
										className='block block-mid'
										x='20'
										y='60'
										width='140'
										height='70'
										rx='8'
									/>
									<rect
										className='block block-top'
										x='40'
										y='20'
										width='100'
										height='50'
										rx='8'
									/>
								</g>

								{/* crane */}
								<g className='crane' transform='translate(40,20)'>
									<rect
										x='20'
										y='40'
										width='18'
										height='260'
										rx='6'
										className='crane-tower'
									/>
									<g className='arm' transform='translate(30,40)'>
										<rect
											x='0'
											y='-8'
											width='240'
											height='10'
											rx='4'
											className='crane-arm'
										/>
										<g transform='translate(220,-6)'>
											<line
												x1='0'
												y1='0'
												x2='0'
												y2='140'
												stroke='var(--primary)'
												strokeWidth='3'
												className='hook-line'
												strokeLinecap='round'
											/>
											<rect
												x='-18'
												y='140'
												width='36'
												height='26'
												rx='6'
												className='hook-box'
											/>
											{/* small load */}
											<g className='load' transform='translate(-36,168)'>
												<rect
													x='0'
													y='0'
													width='72'
													height='26'
													rx='6'
													className='load-rect'
												/>
												<text
													x='36'
													y='18'
													textAnchor='middle'
													className='load-text'
												>
													LOAD
												</text>
											</g>
										</g>
									</g>
								</g>

								{/* caution board */}
								<g transform='translate(30,320)'>
									<rect
										x='0'
										y='0'
										width='160'
										height='36'
										rx='10'
										className='caution'
									/>
									<text
										x='80'
										y='24'
										textAnchor='middle'
										className='caution-text'
									>
										UNDER CONSTRUCTION
									</text>
								</g>
							</svg>

							{/* caption */}
							<div className='mt-4 text-sm text-muted-foreground text-center max-w-sm'>
								Our team is putting the finishing touches. Thanks for your
								patience — exciting things ahead.
							</div>
						</div>
					</div>
				</aside>
			</div>

			{/* Inline animation & style (keeps component self-contained) */}
			<style>{`
        /* Respect prefers-reduced-motion */
        @media (prefers-reduced-motion: reduce) {
          .cloud, .arm, .hook-line, .load, .building .block, .clouds { animation: none !important; transition: none !important; }
        }

        /* CLOUDS */
        .cloud { fill: var(--card); opacity: 0.95; filter: drop-shadow(0 6px 10px rgba(0,0,0,0.06)); }
        .clouds .c1 { transform-origin: 120px 50px; animation: cloud-move-1 18s linear infinite; }
        .clouds .c2 { transform-origin: 320px 35px; animation: cloud-move-2 22s linear infinite; }
        .clouds .c3 { transform-origin: 480px 70px; animation: cloud-move-3 16s linear infinite; }
        @keyframes cloud-move-1 { 0% { transform: translateX(-20px);} 50% { transform: translateX(24px);} 100% { transform: translateX(-20px);} }
        @keyframes cloud-move-2 { 0% { transform: translateX(40px);} 50% { transform: translateX(-32px);} 100% { transform: translateX(40px);} }
        @keyframes cloud-move-3 { 0% { transform: translateX(-8px);} 50% { transform: translateX(18px);} 100% { transform: translateX(-8px);} }

        /* BUILDING BLOCKS: staggered pop + gentle bob */
        .building .block { fill: var(--accent); stroke: var(--sidebar-border); stroke-width: 1; transform-origin: center; animation: block-pop 800ms ease forwards, block-bob 4s ease-in-out infinite; opacity: 0; }
        .building .block-large { animation-delay: 140ms; fill: var(--accent); }
        .building .block-mid { animation-delay: 260ms; fill: var(--secondary); }
        .building .block-top { animation-delay: 360ms; fill: var(--primary); }
        @keyframes block-pop {
          0% { transform: translateY(18px) scale(.96); opacity: 0; }
          70% { transform: translateY(-6px) scale(1.02); opacity: 1; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes block-bob {
          0% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
          100% { transform: translateY(0); }
        }

        /* CRANE: arm rotate + hook sway + load bob */
        .crane-tower { fill: var(--sidebar); stroke: var(--sidebar-border); }
        .crane-arm { fill: var(--primary); transform-origin: 30px 30px; animation: arm-swing 6s ease-in-out infinite; }
        @keyframes arm-swing {
          0% { transform: rotate(-2deg); }
          50% { transform: rotate(3deg); }
          100% { transform: rotate(-2deg); }
        }
        .hook-line { stroke: var(--primary); stroke-dasharray: 6 6; animation: hook-sway 3s ease-in-out infinite; transform-origin: 270px 60px; }
        .hook-box { fill: var(--primary); stroke: var(--card-foreground); }
        .load-rect { fill: var(--card-foreground); opacity: 0.95; }
        .load-text { font-family: ui-sans-serif, system-ui; fill: var(--foreground); font-size: 11px; font-weight:700; }
        @keyframes hook-sway {
          0% { transform: translateX(0) rotate(-2deg); }
          50% { transform: translateX(8px) rotate(2deg); }
          100% { transform: translateX(0) rotate(-2deg); }
        }
        .load { animation: load-bob 3s ease-in-out infinite; transform-origin: center; }
        @keyframes load-bob { 0% { transform: translateY(0);} 50% { transform: translateY(4px);} 100% { transform: translateY(0);} }

        /* CAUTION sign */
        .caution { fill: var(--destructive); }
        .caution-text { fill: var(--primary-foreground); font-weight:700; font-family: ui-sans-serif, system-ui; font-size: 12px; }

        /* accessibility: focus outline for links/buttons */
        a:focus, button:focus, input:focus { outline: 3px solid var(--ring); outline-offset: 2px; }

        /* nice touch for dark mode (optional if you already have vars) */
        :root { --card-foreground: var(--card-foreground); } /* keep theme variables used above */

      `}</style>
		</div>
	);
}
