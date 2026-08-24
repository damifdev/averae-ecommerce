import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch } from 'wouter';
import ErrorBoundary from './components/ErrorBoundary';
import { ThemeProvider } from './contexts/ThemeContext';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Account from './pages/Account';
import Wishlist from './pages/Wishlist';
import SavedItems from './pages/SavedItems';
import Admin from './pages/Admin';
import Checkout from './pages/Checkout';
import { Edit, EditArticle, Trends } from './pages/Discovery';
import Contact from './pages/Contact';
import Delivery from './pages/Delivery';
import Returns from './pages/Returns';
import FAQ from './pages/FAQ';
import SizeGuide from './pages/SizeGuide';
import CategoryLanding from './pages/CategoryLanding';
import NotFound from './pages/NotFound';
import { FloatingFAQHelp } from './components/CheckoutHelpDrawer';

function Router() {
  return <Switch>
    <Route path="/" component={Home} />
    <Route path="/shop" component={Shop} />
    <Route path="/hair" component={() => <CategoryLanding slug="hair" />} />
    <Route path="/thrift-wear" component={() => <CategoryLanding slug="thrift-wear" />} />
    <Route path="/product/:id" component={ProductDetail} />
    <Route path="/cart" component={Cart} />
    <Route path="/account" component={Account} />
    <Route path="/wishlist" component={Wishlist} />
    <Route path="/saved-items" component={SavedItems} />
    <Route path="/admin" component={Admin} />
    <Route path="/checkout" component={Checkout} />
    <Route path="/trends" component={Trends} />
    <Route path="/edit" component={Edit} />
    <Route path="/edit/:slug" component={EditArticle} />
    <Route path="/contact" component={Contact} />
    <Route path="/delivery" component={Delivery} />
    <Route path="/returns" component={Returns} />
    <Route path="/faq" component={FAQ} />
    <Route path="/size-guide" component={SizeGuide} />
    <Route component={NotFound} />
  </Switch>;
}

export default function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Toaster /><Router /><FloatingFAQHelp /></TooltipProvider></ThemeProvider></ErrorBoundary>;
}
