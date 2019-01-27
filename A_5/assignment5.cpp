//
// This source code is property of the Computer Graphics and Visualization 
// chair of the TU Dresden. Do not distribute in modified or unmodified form! 
// Copyright (C) 2017, 2018 CGV TU Dresden - All Rights Reserved
//

#include <vtkAutoInit.h>
// Needed for general rendering
VTK_MODULE_INIT(vtkRenderingOpenGL2);
// Needed for interactive controls
VTK_MODULE_INIT(vtkInteractionStyle);
// Guess what that is needed for
VTK_MODULE_INIT(vtkRenderingVolumeOpenGL2);
// Needed for the text on the slider
VTK_MODULE_INIT(vtkRenderingFreeType);

#include "vtkhelper.h"

#include <vtkSmartPointer.h>
#include <vtkImageData.h>

#include <vtkXMLImageDataReader.h>
#include <vtkPiecewiseFunction.h>
#include <vtkColorTransferFunction.h>
#include <vtkVolumeProperty.h>
#include <vtkSmartVolumeMapper.h>
#include <vtkActor.h>

#include <vtkMarchingCubes.h>
#include <vtkDataSetMapper.h>
#include <vtkLookupTable.h>

#include <vtkSliderRepresentation2D.h>
#include <vtkSliderWidget.h>
#include <vtkRenderWindowInteractor.h>
#include <vtkCommand.h>

class IsoSliderCallback : public vtkCommand {
private:
	vtkSmartPointer<vtkMarchingCubes> isoSurface;
	IsoSliderCallback() {}

public:
	static IsoSliderCallback *New() { return new IsoSliderCallback; }

	void SetData( vtkSmartPointer<vtkMarchingCubes> isoSurface ) { this->isoSurface = isoSurface; }

	virtual void Execute( vtkObject *caller, unsigned long eventId, void *callData ) {
		// Get our slider widget back
		vtkSliderWidget *slider = static_cast<vtkSliderWidget*>(caller);

		// Get the value
		double value = static_cast<vtkSliderRepresentation*>(slider->GetRepresentation())->GetValue();

		// Set new Iso value
		isoSurface->SetValue( 0, value );
		isoSurface->Update();
	}
};

int main()
{
	vtkSmartPointer<vtkXMLImageDataReader> source = vtkSmartPointer<vtkXMLImageDataReader>::New();
	source->SetFileName("../data/headsq-half.vti");


	// Task 5.2

	// visualize volume directly:
	// * create a vtkSmartVolumeMapper that gets its input from the source
	// * enable GPU rendering and set the appropriate volume blending
	// * create an opacity transfer function as vtkPiecewiseFunction and add density-opacity pairs
	// * create a color transfer function as vtkColorTransferFunction and add density-color pairs
	// * create a vtkVolumeProperty object, set the opacity and color function and set the 
	//   interpolation type to linear. Turn shading on

	vtkSmartPointer<vtkSmartVolumeMapper> volumeMapper = vtkSmartPointer<vtkSmartVolumeMapper>::New();
	// connect to the contour filter output (the pipeline is source->contourFilter->contourMapper->...)
	volumeMapper->SetInputConnection(source->GetOutputPort());

	vtkSmartPointer<vtkPiecewiseFunction> volumeOpacity = vtkSmartPointer<vtkPiecewiseFunction>::New();
	vtkSmartPointer<vtkColorTransferFunction>volumeColor =
		vtkSmartPointer<vtkColorTransferFunction>::New();

	vtkSmartPointer<vtkPiecewiseFunction> volumeGradientOpacity =
		vtkSmartPointer<vtkPiecewiseFunction>::New();
	volumeGradientOpacity->AddPoint(0, 0.0);
	volumeGradientOpacity->AddPoint(90, 0.5);

	volumeOpacity->AddPoint(0, 0.00);
	volumeOpacity->AddPoint(9000, 0.15);
		
	volumeColor->AddRGBPoint(0, 0.0, 0.0, 0.0);
	volumeColor->AddRGBPoint(500, 0.70, 0.7, 0.3);
	volumeColor->AddRGBPoint(1000, 0.0, 0.5, 0.3);


	vtkSmartPointer<vtkVolumeProperty> volumeProperty =
		vtkSmartPointer<vtkVolumeProperty>::New();
	volumeProperty->SetColor(volumeColor);
	volumeProperty->SetScalarOpacity(volumeOpacity);
//	volumeProperty->SetGradientOpacity(volumeGradientOpacity);
	volumeProperty->SetInterpolationTypeToLinear();
	volumeProperty->ShadeOn();



	// * create the actor as a vtkVolume object and assign the previously created volume mapper and property object
	// * create a vtkRenderer and a vtkRenderWindow. (Note that you cannot use the method createRenderWindowFromMapper 
	//   since it does not create a vtkVolume actor.)
	// * you can create interactor and display as usual via doRenderingAndInteraction(window) to test your code to this point.
	// (delete the line when you're done)

	vtkSmartPointer<vtkVolume> volume =
		vtkSmartPointer<vtkVolume>::New();
	volume->SetMapper(volumeMapper);

	volume->SetProperty(volumeProperty);

	vtkSmartPointer<vtkRenderer> render =
		vtkSmartPointer<vtkRenderer>::New();

	vtkSmartPointer<vtkRenderWindow> renWin =
		vtkSmartPointer<vtkRenderWindow>::New();
	renWin->AddRenderer(render);

	render->AddViewProp(volume);




	// visualize volume via isosurfaces:
	// * generate polygon data from the volume dataset by using a vtkMarchingCubes filter
	// * set number of contours to one, set scalar value of that contour to something meaningful
	// * manually update the Marching Cubes filter aftwerwards via Update() method to apply the contour value
	// * create vtkDataSetMapper and set input connection, don't use scalars for coloring (set scalar visibility to false)
	// * create vtkActor and set mapper as input
	// * assign actor to existing renderer
	vtkSmartPointer< vtkMarchingCubes> isoFilter = vtkSmartPointer< vtkMarchingCubes>::New();
	isoFilter->SetInputConnection(source->GetOutputPort());
	isoFilter->SetNumberOfContours(1);
//	isoFilter->SetValue(0, 800);
	isoFilter->Update();

	vtkSmartPointer<vtkDataSetMapper> dataMapper = vtkSmartPointer<vtkDataSetMapper>::New();
	dataMapper->SetInputConnection(isoFilter->GetOutputPort());
	dataMapper->SetScalarVisibility(0);



	vtkSmartPointer<vtkRenderWindow> window = vtkSmartPointer<vtkRenderWindow>::New();
	vtkSmartPointer<vtkActor> actor = vtkSmartPointer<vtkActor>::New();

	
	// connect everything
	actor->SetMapper(dataMapper);
	render->AddActor(actor);
	

	
	// * create a slider as a slider 2d representation
	// * set the minimum and maximum values to correspond to the dataset
	// * show a slider title
	// * show the current slider value above the slider with one digit behind the decimal point (setLabelFormat)
	// * you need to assign an interactor to the slider in order to use it: 
	// * create a vtkRenderWindowInteractor and assign a rendering window 
	// * create a new vtkSliderWidget and assign the previous interactor and representation to it
	// * use SetAnimationModeToAnimate() and EnabledOn()

	//Source
	//https://vtk.org/Wiki/VTK/Examples/Cxx/Widgets/Slider2D


	vtkSmartPointer<vtkSliderRepresentation2D> sliderRep =
		vtkSmartPointer<vtkSliderRepresentation2D>::New();
	
	sliderRep->SetMinimumValue(1.0);
	sliderRep->SetMaximumValue(2000.0);
	sliderRep->SetValue(5.0);
	sliderRep->SetTitleText("Iso Slider");
	sliderRep->SetLabelFormat("%.00f");

	sliderRep->GetPoint1Coordinate()->SetCoordinateSystemToDisplay();
	sliderRep->GetPoint1Coordinate()->SetValue(40, 40);
	sliderRep->GetPoint2Coordinate()->SetCoordinateSystemToDisplay();
	sliderRep->GetPoint2Coordinate()->SetValue(1000, 40);


	vtkSmartPointer<vtkRenderWindowInteractor> renderWindowInteractor =
		vtkSmartPointer<vtkRenderWindowInteractor>::New();
	renderWindowInteractor->SetRenderWindow(renWin);

	vtkSmartPointer<vtkSliderWidget> sliderWidget =
		vtkSmartPointer<vtkSliderWidget>::New();
	sliderWidget->SetInteractor(renderWindowInteractor);
	sliderWidget->SetRepresentation(sliderRep);
	sliderWidget->SetAnimationModeToAnimate();
	sliderWidget->EnabledOn();


	// * invoke the callback code:
	// * create an IsoSlider Callback
	// * assign the Marching Cubes data
	// * assign the callback object to the slider via AddObserver(vtkCommand::InteracationEvent, ptrToCallback);

	vtkSmartPointer<IsoSliderCallback> callback = vtkSmartPointer<IsoSliderCallback>::New();
	callback->SetData(isoFilter);
	sliderWidget->AddObserver(vtkCommand::InteractionEvent, callback);


	// * finally you can then use the version of doRenderingAndInteraction that accepts an interactor object.

	doRenderingAndInteraction(renderWindowInteractor);
	

	return 0;
}
