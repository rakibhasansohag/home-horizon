import React from 'react';
import Banner from './Banner';
import Recommendations from './Recommendations';
import ServicesSection from './ServiceSection';
import AdvertisedProperties from './AdvertisedProperties';
import LatestUserReviews from './LatestUserReviews';

function Home() {
	return (
		<main className=''>
			<Banner />
			<Recommendations />
			<ServicesSection />
			{/* TODO : Will added dynamic newst home from database or show some dummy data if there is none  */}
			<AdvertisedProperties />
			<LatestUserReviews />
		</main>
	);
}

export default Home;
