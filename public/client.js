let fixedNavIsVisible = false;
let navButtonShouldShowText = false;
let $HomepageSiteLogo,
    $SiteHeader,
    $SiteNav,
    $SiteNavButton,
    SiteNavButtonOffsetHeight
    ;

// At the $bp-medium breakpoint, the navigation gets
// put behind a hamburger menu.
const navIsBurgerBreakpoint = 750; 

const getHomepageLogo = () => {
  // On the homepage, we want to show the fixed position 
  // header after the logo scrolls out of view.
  const $IntroductionResults = document.getElementsByClassName('Introduction');
  if ($IntroductionResults.length === 0) return false;

  const $SiteLogoResults = $IntroductionResults[0].getElementsByClassName('SiteLogo')
  if ($SiteLogoResults.length === 0) return false;
  return $SiteLogoResults[0];
}

const getSiteHeader = () => {
  const $SiteHeaderResults = document.getElementsByClassName('SiteHeader');
  if ($SiteHeaderResults.length === 0) return false;
  return $SiteHeaderResults[0];

}

const changeNavClasses = () => {
  if (window.innerWidth <= navIsBurgerBreakpoint) {
    const showTheText = window.scrollY < SiteNavButtonOffsetHeight + 20;
    if (showTheText && !navButtonShouldShowText) {
      navButtonShouldShowText = true;
      makeButtonTextVisible(true);
    }
    if (!showTheText && navButtonShouldShowText) {
      navButtonShouldShowText = false;
      makeButtonTextVisible(false);
    }
  } else {
    // First, let’s see what page we’re on. We mostly want to
    // be sure we’re not on the homepage.
    const pageSlug = document.getElementsByTagName('body')[0].dataset.page;
    const isHomepage = pageSlug === 'homepage';

    const $breakElement = (isHomepage) ? $HomepageSiteLogo : $SiteHeader;
    if (!$breakElement) return false;

    const generousBonusSpace = (isHomepage) ? 15 : 30;
    const breakpoint = $breakElement.getBoundingClientRect().bottom + generousBonusSpace;
    if (breakpoint < 0 && !fixedNavIsVisible) {
      fixedNavIsVisible = true;
      makeNavFixed(true);
    }
    if (breakpoint >= 0 && fixedNavIsVisible) {
      fixedNavIsVisible = false;
      makeNavFixed(false);
    }
  }
}

const makeButtonTextVisible = (shouldBeVisible) => {  
  if (shouldBeVisible) $SiteNavButton.classList.add('is-activated');
  if (!shouldBeVisible) $SiteNavButton.classList.remove('is-activated');
}

const makeNavFixed = (shouldBeFixed) => {  
  if (shouldBeFixed) $SiteNav.classList.add('is-fixed');
  if (!shouldBeFixed) $SiteNav.classList.remove('is-fixed');
}

const handleSiteNavButtonClick = (e) => {
  e.preventDefault;
  const isMenuVisible = $SiteNav.dataset.menuVisible === 'true';
  $SiteNav.dataset.menuVisible = !isMenuVisible;
}

const setElementValues = () => {
  $HomepageSiteLogo = getHomepageLogo();
  $SiteHeader = getSiteHeader();
  
  const $SiteNavResults = document.getElementsByClassName('SiteNav');
  $SiteNav = ($SiteNavResults.length > 0) ? $SiteNavResults[0] : false;

  const $SiteNavButtonResults = document.getElementsByClassName('SiteNav__button');
  $SiteNavButton = ($SiteNavButtonResults.length > 0) ? $SiteNavButtonResults[0] : false;
  SiteNavButtonOffsetHeight = $SiteNavButton.offsetHeight;
}

document.onreadystatechange = function () {
  if (document.readyState === "complete") {
    setElementValues();
    if ($SiteNavButton) $SiteNavButton.onclick = handleSiteNavButtonClick;
    const checkScroll = window.setInterval(changeNavClasses, 10)
  }
}