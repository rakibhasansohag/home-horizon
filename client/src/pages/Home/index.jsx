import Banner from './Banner';
import Recommendations from './Recommendations';
import ServicesSection from './ServiceSection';
import AdvertisedProperties from './AdvertisedProperties';
import NewestHomes from './NewestHomes';
import LatestUserReviews from './LatestUserReviews';

function Home() {
	return (
		<div>
			<Banner />
			<Recommendations />
			<ServicesSection />
			<NewestHomes />
			<AdvertisedProperties />
			<LatestUserReviews />
		</div>
	);
}

export default Home;
