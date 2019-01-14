//
// This source code is property of the Computer Graphics and Visualization 
// chair of the TU Dresden. Do not distribute in modified or unmodified form! 
// Copyright (C) 2018 CGV TU Dresden - All Rights Reserved
//
//Edited from Tabita Mädler & Paul Riedel

#include <vtkAutoInit.h>
VTK_MODULE_INIT(vtkRenderingOpenGL2);
VTK_MODULE_INIT(vtkInteractionStyle);
VTK_MODULE_INIT(vtkRenderingFreeType);

// VTK includes
#include <vtkSmartPointer.h>
#include <vtkDEMReader.h>
#include <vtkContourFilter.h>
#include <vtkImageGradientMagnitude.h>
#include <vtkWarpScalar.h>
#include <vtkDataSetMapper.h>

#include <vtkActor.h>
#include <vtkProperty.h>
#include <vtkRenderer.h>
#include <vtkRenderWindow.h>
#include <vtkRenderWindowInteractor.h>
#include <vtkInteractorStyleTrackballCamera.h>
#include <vtkRendererCollection.h>

#include <vtkColorTransferFunction.h>
#include <vtkScalarBarActor.h>
#include <vtkLookupTable.h>
#include <vtkTextRenderer.h>

// standard includes
#include <vector>
#include <algorithm>
#include <stdarg.h>




// ----- utility functions -----
/*
 RGB zu Double converter
*/
void convertRGBToDouble(double r,double g, double b,double *rgb ) {
	rgb[0] = r / 255;
	rgb[1] = g / 255;
	rgb[2] = b / 255;
	rgb[3] = 1;
}

void setGradientBackground(vtkSmartPointer<vtkRenderer> renderer)
{
	renderer->GradientBackgroundOn();
	renderer->SetBackground(0.5, 0.5, 0.5);
	renderer->SetBackground2(0.9, 0.9, 0.9);
}
// ----- end of utility functions -----


vtkSmartPointer<vtkRenderWindow> createRenderWindowFromMapper(vtkSmartPointer<vtkMapper> mapper)
{
	//create renderer, window and actor
	vtkSmartPointer<vtkRenderer> renderer = vtkSmartPointer<vtkRenderer>::New();
	vtkSmartPointer<vtkRenderWindow> window = vtkSmartPointer<vtkRenderWindow>::New();
	vtkSmartPointer<vtkActor> actor = vtkSmartPointer<vtkActor>::New();

	// let's have a fancy background for the canvas
	setGradientBackground(renderer);
	// fallback color, is used whenever mappers do not utilize scalars for coloring
	actor->GetProperty()->SetColor(1, 1, 1);

	// connect everything
	actor->SetMapper(mapper);
	renderer->AddActor(actor);
	window->AddRenderer(renderer);

	// set window size and return
	window->SetSize(800, 800);
	return window;
}

vtkSmartPointer<vtkRenderWindow> createRenderWindowFromMultipleMappers(std::vector<vtkSmartPointer<vtkDataSetMapper>> mappers, vtkSmartPointer<vtkScalarBarActor> scalarBar)
{
	// create renderer and window
	vtkSmartPointer<vtkRenderer> renderer = vtkSmartPointer<vtkRenderer>::New();
	vtkSmartPointer<vtkRenderWindow> window = vtkSmartPointer<vtkRenderWindow>::New();


	// let's have a fancy background for the canvas
	setGradientBackground(renderer);

	// connect window and renderer
	window->AddRenderer(renderer);

	// task 4.2
	// for every mapper we create an actor and add it to the renderer
	// (do not forget to set the fallback color (see createRenderWindowFromMapper(...) )

// let's have a fancy background for the canvas
	//setGradientBackground(renderer);

	for each (vtkSmartPointer<vtkDataSetMapper> mapper in mappers)
	{
		vtkSmartPointer<vtkActor> actor = vtkSmartPointer<vtkActor>::New();
		actor->GetProperty()->SetColor(1, 1, 1);

		actor->SetMapper(mapper);
		renderer->AddActor(actor);
		
	}

	renderer->AddActor2D(scalarBar);
	// set window size and return
	window->SetSize(800, 800);
	return window;
}

void doRenderingAndInteraction(vtkSmartPointer<vtkRenderWindow> window)
{
	// create interactor and connect a window
	vtkSmartPointer<vtkRenderWindowInteractor> interactor = vtkSmartPointer<vtkRenderWindowInteractor>::New();
	interactor->SetRenderWindow(window);
	// set an interaction style
	interactor->SetInteractorStyle(vtkInteractorStyleTrackballCamera::New());

	// execute render/interaction loop
	interactor->Initialize();
	interactor->Start();

	// close the window when finished
	window->Finalize();
}


int main(int argc, char * argv[])
{
	// -- begin of basic visualization network definition --

	// 1. create source
	vtkSmartPointer<vtkDEMReader> source = vtkSmartPointer<vtkDEMReader>::New();
	source->SetFileName("../data/SainteHelens.dem");
	source->Update();

	/*
	Low und High Daten der Quelldatei
	Wichtig für die Range Angaben und der Einfärbung
	*/
	double low=source->GetElevationBounds()[0];
	double high = source->GetElevationBounds()[1];





	/*
	Mein WarpFilter
	*/


	vtkSmartPointer<vtkWarpScalar> warpFilter = vtkSmartPointer<vtkWarpScalar>::New();
	warpFilter->SetInputConnection(source->GetOutputPort());
	warpFilter->SetScaleFactor(2);

	warpFilter->Update();



	// 2. create filters
	// a) contour filter
	vtkSmartPointer<vtkContourFilter> contourFilter = vtkSmartPointer<vtkContourFilter>::New();
	// use source as filter input
	contourFilter->SetInputConnection(warpFilter->GetOutputPort());
	// set the height value at which the contour line shall be drawn

	/*
	ContourFilter wird hier angepasst um mehr Höhenlinien anzuzeigen, in regelmäßigen Abständen
	Durch anpassen des contourCount können mehr angepasst werden, im gleichen zu muss aber (noch) eine neue Farbe,per Hand, hinzugefügt werden
	*/
	int contourCount = 17;
	for (int i = 0; i < contourCount; i++) {
		contourFilter->SetValue(i, low + i * (high-low)/contourCount);
	}

	
	vtkSmartPointer<vtkDataSetMapper> contourMapper = vtkSmartPointer<vtkDataSetMapper>::New();
	// connect to the contour filter output (the pipeline is source->contourFilter->contourMapper->...)
	contourMapper->SetInputConnection(contourFilter->GetOutputPort());
	// avoid z-buffer fighting with small polygon shift
	contourMapper->SetResolveCoincidentTopologyToPolygonOffset();
	// don't use the scalar value to color the line, see fallback coloring via actor in createRenderWindowFromMapper
	contourMapper->ScalarVisibilityOff();


	/*
	Meine LookUpTable
	Hier wären noch Optimierungsmöglichkeiten durch einen Cleveren Algorithmus, aber aus Zeitgründen leider nur hardcoded

	Mit der Hilffunktion convertRGBToDouble (siehe oben unter Utility) um die RGB-Werte in Doubles zu konvertieren
	*/


	
	vtkSmartPointer<vtkLookupTable> lut = vtkSmartPointer<vtkLookupTable>::New();
	int tablesize = contourCount;
	lut->SetNumberOfColors(tablesize);
	lut->SetRange(low, high);
	lut->Build();


	double rgb[4] = { 0,0,0,1 };
	convertRGBToDouble(30, 0, 0, rgb);
	lut->SetTableValue(0, rgb);
	convertRGBToDouble(70, 0, 0, rgb);
	lut->SetTableValue(1, rgb);
	convertRGBToDouble(120, 0, 0, rgb);
	lut->SetTableValue(2, rgb);
	convertRGBToDouble(170, 0, 0, rgb);
	lut->SetTableValue(3, rgb);
	convertRGBToDouble(200, 0, 0, rgb);
	lut->SetTableValue(4, rgb);
	convertRGBToDouble(209, 0, 0, rgb);
	lut->SetTableValue(5, rgb);
	convertRGBToDouble(219, 34, 0, rgb);
	lut->SetTableValue(6, rgb);
	convertRGBToDouble(224, 55, 0, rgb);
	lut->SetTableValue(7, rgb);
	convertRGBToDouble(230, 85, 0, rgb);
	lut->SetTableValue(8,rgb);
	convertRGBToDouble(239, 96, 0, rgb);
	lut->SetTableValue(9, rgb);
	convertRGBToDouble(238, 119, 0, rgb);
	lut->SetTableValue(10, rgb);
	convertRGBToDouble(255, 187, 0, rgb);
	lut->SetTableValue(11, rgb);
	convertRGBToDouble(255, 255, 0, rgb);
	lut->SetTableValue(12, rgb);
	convertRGBToDouble(255, 255, 27, rgb);
	lut->SetTableValue(13, rgb);
	convertRGBToDouble(255, 255, 91, rgb);
	lut->SetTableValue(14, rgb);
	convertRGBToDouble(255, 255, 127, rgb);
	lut->SetTableValue(15, rgb);
	convertRGBToDouble(255,225,200, rgb);
	lut->SetTableValue(16, rgb);
	/*
	mein Mapper

	*/
	vtkSmartPointer<vtkDataSetMapper> warpMapper = vtkSmartPointer<vtkDataSetMapper>::New();
	warpMapper->SetInputConnection(warpFilter->GetOutputPort());

	warpMapper->UseLookupTableScalarRangeOn();
	//Bereitstellen der Tabelle, für das Farbmapping
	warpMapper->SetLookupTable(lut);
	
	warpMapper->Update();
	// -- end of basic visualization network definition --


	/*
	Legende
	übernommen von https://vtk.org/Wiki/VTK/Examples/Cxx/Visualization/ScalarBarActor
	*/

	vtkSmartPointer<vtkScalarBarActor> scalarBar =
		vtkSmartPointer<vtkScalarBarActor>::New();
	scalarBar->SetLookupTable(warpMapper->GetLookupTable());
	scalarBar->SetTitle("Legende");
	scalarBar->SetNumberOfLabels(3); 
	
	scalarBar->SetLabelFormat("%.0f");
	scalarBar->SetLookupTable(lut);

	// 4. create actors, renderers, render windows 	


	vtkSmartPointer<vtkRenderWindow> contourWindow = createRenderWindowFromMapper( contourMapper );
	vtkSmartPointer<vtkRenderWindow> gradientWindow = createRenderWindowFromMapper(warpMapper);
	vtkSmartPointer<vtkRenderWindow> warpWindow = createRenderWindowFromMultipleMappers({ warpMapper, contourMapper }, scalarBar);

	// 5. successively show each window and allow user interaction (until it is closed)

	//doRenderingAndInteraction( imageWindow );
	//doRenderingAndInteraction( contourWindow );
	//doRenderingAndInteraction( gradientWindow );

	doRenderingAndInteraction(warpWindow);
	return 0;
}